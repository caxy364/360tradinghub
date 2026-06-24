import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';

const getAppId = (): string => '111670';

const getTokenAndCurrency = () => {
    try {
        const loginId = localStorage.getItem('active_loginid') || '';

        // accountsList stores { loginid: derivApiToken } — the correct Deriv API token
        const accountsList: Record<string, string> = JSON.parse(localStorage.getItem('accountsList') || '{}');
        const token = accountsList[loginId] || '';

        // clientAccounts stores full account details including currency
        const clientAccounts: Record<string, { currency?: string }> = JSON.parse(
            localStorage.getItem('clientAccounts') || '{}'
        );
        const currency = clientAccounts[loginId]?.currency || 'USD';

        return { loginId, token, currency };
    } catch {
        return { loginId: '', token: '', currency: 'USD' };
    }
};

export const DTraderTab = observer(() => {
    const { client } = useStore();

    const [authState, setAuthState] = React.useState(() => getTokenAndCurrency());

    // Re-read token/currency when MobX store updates (loginid or currency changes)
    React.useEffect(() => {
        setAuthState(getTokenAndCurrency());
    }, [client.loginid, client.currency, client.is_logged_in]);

    // Also poll every 2s until we have a token (covers delayed localStorage writes)
    React.useEffect(() => {
        if (authState.token) return;
        const interval = setInterval(() => {
            const latest = getTokenAndCurrency();
            if (latest.token) {
                setAuthState(latest);
                clearInterval(interval);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [authState.token]);

    const { loginId, token, currency } = authState;
    const appId = getAppId();

    const iframeSrc = token && loginId
        ? `https://deriv-dtrader.vercel.app/dtrader?acct1=${loginId}&token1=${token}&cur1=${currency}&lang=EN&app_id=${appId}`
        : `https://deriv-dtrader.vercel.app/dtrader`;

    return (
        <iframe
            key={`${token}-${loginId}-${currency}`}
            src={iframeSrc}
            title="DTrader"
            width="100%"
            height="100%"
            style={{
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
            scrolling="yes"
            allow="fullscreen; clipboard-write; payment"
        />
    );
});

export default DTraderTab;
