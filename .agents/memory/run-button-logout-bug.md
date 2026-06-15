---
name: Run button logout bug + account switching
description: Why clicking Run/trading caused logout, how it was fixed, and account switching OTP fix
---

## The Problem
Clicking Run or starting any trade caused the user to be logged out. Account switching also didn't re-authenticate api_base.

## Root Cause
Two WebSocket systems run in parallel:
- **New system** (`NewDerivAuth.js`): OTP-authenticated WS stored as `window._newSystemWS`. Sets `window._newSystemWSReady = true` on connect.
- **Legacy system** (`api-base.ts` + `appId.js`): `DerivAPIBasic` using `getSocketURL()` → was connecting to the PUBLIC URL because `OAuthTokenExchangeService.getAuthInfo()` returns null when using the new auth flow (token stored under `NEW_AUTH_token`, not `auth_info`).

When the new auth flow is used:
1. `getSocketURL()` returned the PUBLIC URL (no OTP) → `api_base.api` was unauthenticated
2. `authorizeAndSubscribe()` called `this.api.balance()` on unauthenticated WS → failed → catch block called `clearAuthData()` + `setIsAuthorized(false)` → **logout**
3. `reconnectIfNotConnected()` (fired on window `focus`/`online`) cleared auth after 5 failed reconnects → second logout path
4. Account switching via `switchNewAccount()` only updated `window._newSystemWS` but did NOT reinitialize `api_base`, leaving it on the old account

## Fixes Applied

### 1. `src/external/bot-skeleton/services/api/api-base.ts`
**authorizeAndSubscribe()**: Added guard — when `window._newSystemWSReady` is true, skip `this.api.balance()` and use cached data from `sessionStorage cached_balances` + `DerivWSAccountsService.getStoredAccounts()`. Catch block guarded to only call `clearAuthData()`/`setIsAuthorized(false)` when `_newSystemWSReady` is false.

**reconnectIfNotConnected()**: Removed auth-clearing block entirely. Network reconnection should never log out the user.

### 2. `src/components/shared/utils/config/config.ts`
**getSocketURL()**: Added fallback — when `auth_info` is not in sessionStorage, dynamically imports `getNewToken()` from `NewDerivAuth.js` and uses the new auth token to get an OTP-authenticated WS URL. This removes the public URL fallback for logged-in users.

### 3. `src/auth/NewDerivAuth.js`
**switchNewAccount()**: After `createNewWebSocket()` finishes, also calls `DerivWSAccountsService.clearCache()` and `api_base.init(true)` so the legacy WS reconnects to the new account with a fresh OTP. Both systems now switch in sync.

**Why:** `clearAuthData()`/`setIsAuthorized(false)` must never be called when the new OTP system has already established auth. And `api_base.api` must always use OTP for authentication, never the public URL.
