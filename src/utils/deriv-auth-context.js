/**
 * Shared Deriv authentication context reader.
 * Uses ONLY the new Deriv OAuth system (NEW_AUTH_token in localStorage).
 * Import this in any trading page instead of duplicating auth logic.
 */
export function getDerivAuthContext() {
    try {
        const token = localStorage.getItem('NEW_AUTH_token');
        const expiry = localStorage.getItem('NEW_AUTH_expiry');

        if (!token || !expiry || Date.now() >= Number(expiry)) return null;

        const activeLoginId = localStorage.getItem('active_loginid');
        const detailsRaw = localStorage.getItem('client_account_details');
        const details = detailsRaw ? JSON.parse(detailsRaw) : [];
        const accountsArr = Array.isArray(details) ? details : [];

        const normalized = accountsArr.map(a => ({ ...a, account_id: a.account_id || a.loginid }));
        const activeAccount =
            normalized.find(a => a.account_id === activeLoginId) ||
            normalized[0];

        if (!activeAccount?.account_id) return null;

        return { accessToken: token, activeAccount };
    } catch (error) {
        console.error('[DerivAuth] Failed to read auth context:', error);
        return null;
    }
}
