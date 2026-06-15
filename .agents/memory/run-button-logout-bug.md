---
name: Run button logout bug
description: Why clicking Run/trading caused logout and how it was fixed in api-base.ts
---

## The Problem
Clicking Run or starting any trade caused the user to be logged out.

## Root Cause
Two WebSocket systems run in parallel:
- **New system** (`NewDerivAuth.js`): OTP-authenticated WS stored as `window._newSystemWS`. Sets `window._newSystemWSReady = true` on connect.
- **Legacy system** (`api-base.ts` + `appId.js`): `DerivAPIBasic` connecting to the PUBLIC URL `https://api.derivws.com/trading/v1/options/ws/public` (no OTP).

When the new auth flow is used, `OAuthTokenExchangeService.getAuthInfo()` returns null (token stored under `NEW_AUTH_token`, not `auth_info`), so `getSocketURL()` returns the PUBLIC URL for the legacy WS.

`authorizeAndSubscribe()` then calls `this.api.balance()` on the unauthenticated PUBLIC WS → fails → catch block called `clearAuthData()` + `setIsAuthorized(false)` → logout.

Additionally `reconnectIfNotConnected()` (fired on window `focus`/`online` events) cleared auth after 5 failed reconnect attempts — a second logout path.

## Fix (in `src/external/bot-skeleton/services/api/api-base.ts`)

**Why:** `clearAuthData()`/`setIsAuthorized(false)` must never be called when the new OTP system has already established auth.

**authorizeAndSubscribe()**: Added guard at the top — when `window._newSystemWSReady` is true, skip `this.api.balance()` entirely and reconstruct auth state from cached data (`sessionStorage cached_balances` + `DerivWSAccountsService.getStoredAccounts()`). Also guarded the catch block so it only calls `clearAuthData()`/`setIsAuthorized(false)` when `_newSystemWSReady` is false.

**reconnectIfNotConnected()**: Removed the auth-clearing block entirely. Network reconnection should never log out the user; it only resets the counter and calls `this.init(true)`.
