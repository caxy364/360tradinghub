---
name: 360 Trading Hub merge
description: Key decisions and gotchas from merging 360tradinghub-master into the Replit workspace
---

## Project identity
This is the **360 Trading Hub** — a customized Deriv trading bot template branded for `app.bmtraders.site`. The master branch is the full production build; 360branch is a cleaner template base.

## Files intentionally NOT overwritten from master
- `rsbuild.config.ts` — Replit-specific host/port/HMR config (master has localhost-only settings)
- `.replit` — Replit runner config
- `src/components/shared/workspace-group.tsx` — 360branch has the save button master removed
- `src/components/shared/config.ts` — 360branch has proper env-based config
- `src/services/oauth-token-exchange.service.ts` — workspace version preserved
- `src/services/derivws-accounts.service.ts` — workspace version preserved
- `src/stores/data-collection-store.ts` — workspace version preserved
- `src/stores/google-drive-store.ts` — workspace version preserved
- `src/components/layout/header/logo/BrandLogo.tsx` — workspace version preserved
- `src/hooks/use-mobile-menu-config.tsx` — workspace version preserved

## Extra dependencies added (not in original workspace)
- `axios@^1.15.2` — used by Aibots.js to fetch XML bot files from /public
- `react-icons@^5.6.0` — used by all custom tab components (FaRobot, FaFireAlt, RiAlertFill, IoChevronDown, etc.)
- `sweetalert2@^11.26.24` — used by Overlord, Dualbot, ElitePremium, Eliteflow, Oracle, Higherlower, SmartTrader

## Linux case-sensitivity gotcha
`CustomDash.js` imported `./EliteFlow` but the actual file is `Eliteflow.js` (lowercase 'f'). Fixed to `./Eliteflow`. Always verify import paths match exact filename casing on Linux.

## Custom tabs added (DBOT_TABS in bot-contents.ts)
OVERLORD(2), ELITE_PRIME(3), SIGNALS(4), BOTS(5), SMART_TRADER(6), CHART(7), TUTORIALS(8)

**Why:** master branch has full 360 Hub UI; future tab additions must be registered in `src/constants/bot-contents.ts` AND `src/stores/run-panel-store.ts`.

## Runtime errors that are expected/non-blocking
- DerivAPI 403 on staging WebSocket — needs real Deriv auth credentials to connect
- `react-dom/server.browser.js` factory undefined from toolbox-items — pre-existing issue unrelated to merge
- Google Drive `missing_required_parameter client_id` — needs Google OAuth client config
