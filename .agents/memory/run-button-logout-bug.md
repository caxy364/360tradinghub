---
name: Run button logout bug + account switching + trade placement
description: Why clicking Run/trading caused logout and trades weren't placed, and all fixes applied
---

## System Architecture

Two WebSocket systems run in parallel:
- **New system** (`NewDerivAuth.js`): OTP-authenticated WS → `window._newSystemWS`. Sets `window._newSystemWSReady = true` on connect. Token stored as `NEW_AUTH_token` in localStorage.
- **Legacy system** (`api-base.ts` + `appId.js`): `DerivAPIBasic` using `getSocketURL()` to determine WS URL.

## Bug 1: Logout-on-Run / Logout-on-Focus

`getSocketURL()` → `OAuthTokenExchangeService.getAuthInfo()` returned null (new auth stores token under `NEW_AUTH_token`, not `auth_info`) → returned PUBLIC URL → `api_base.api` connected unauthenticated → `balance()` failed → catch block called `clearAuthData()` + `setIsAuthorized(false)` → **spurious logout**.

Also `reconnectIfNotConnected()` (window focus/online) cleared auth storage after 5 reconnect attempts → second logout path.

## Bug 2: Trades Not Placing ("says login")

`App.tsx` calls `createNewWebSocket()` and `app-root.tsx` calls `api_base.init()` concurrently. In practice `createNewWebSocket()` typically completes first, sets `_newSystemWSReady = true`. Then when `api_base.api` connected and ran `authorizeAndSubscribe()`, a `_newSystemWSReady` guard branch was entered that **never called `this.subscribe()`** and returned early. Without `subscribe()`, the trade engine never receives balance/transaction streams → every `buy` call fails with auth error.

## All Fixes Applied

### 1. `src/external/bot-skeleton/services/api/api-base.ts`

**reconnectIfNotConnected()**: Removed auth-clearing block entirely. Network reconnection must never log the user out.

**authorizeAndSubscribe()**: Removed the `_newSystemWSReady` early-return branch entirely. Now that `getSocketURL()` returns an OTP URL, `balance()` always succeeds and the normal flow (including `this.subscribe()`) runs correctly. Kept the catch block guard: only calls `clearAuthData()`/`setIsAuthorized(false)` when `_newSystemWSReady` is false, so a network hiccup can't cause a spurious logout.

### 2. `src/components/shared/utils/config/config.ts`

**getSocketURL()**: Added fallback — when `auth_info` is not in sessionStorage, dynamically imports `getNewToken()` from `NewDerivAuth.js` and uses the new auth token to get an OTP-authenticated WS URL. Eliminates the public URL fallback for logged-in users.

### 3. `src/auth/NewDerivAuth.js`

**switchNewAccount()**: After `createNewWebSocket()` finishes, clears the OTP cache (`DerivWSAccountsService.clearCache()`) and calls `api_base.init(true)` so both the new system WS and the legacy WS reconnect to the new account in sync. No page reload required.

## Why The `_newSystemWSReady` Branch Was Wrong

It was added as a workaround when `api_base.api` was connecting to the PUBLIC URL. But:
1. The branch skipped `this.subscribe()` — breaking the trade engine
2. The fix to `getSocketURL()` made the branch unnecessary (OTP URL means `balance()` succeeds normally)
3. Race condition: `createNewWebSocket()` almost always completes before `api_base.api` connects, so the branch fired on every login

**Rule**: Never add auth-bypassing shortcuts in `authorizeAndSubscribe()`. Fix `getSocketURL()` to return the right URL instead.

## Verified Correct Flow

1. User logs in → `NEW_AUTH_token` saved to localStorage
2. `api_base.init()` → `getSocketURL()` finds `NEW_AUTH_token` via `getNewToken()` → fetches OTP → returns OTP URL
3. `api_base.api` connects to OTP URL
4. `onsocketopen()` → `authorizeAndSubscribe()` → `balance()` succeeds on OTP WS
5. Auth state set, `subscribe()` called → trade engine streams ready
6. Bot runs, `buy` calls authenticated → **trades placed correctly**
7. Account switch → `switchNewAccount()` reconnects both WS systems to new account
