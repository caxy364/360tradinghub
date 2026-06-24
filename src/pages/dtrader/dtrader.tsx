import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';

const getAppId = (): string => '111670';

export const DTraderTab = observer(() => {
    const { client } = useStore();

    const loginId = localStorage.getItem('active_loginid') || client.loginid;
    const accountsList = JSON.parse(localStorage.getItem('accountsList') || '{}');

    // Token: works for both OAuth and legacy (OAuth stores as authToken)
    const token = localStorage.getItem('authToken') || accountsList[loginId] || '';

    // Currency: read from localStorage active_account first (most reliable post-login),
    // then fall back to MobX store, then USD
    let currency = 'USD';
    try {
        const activeAccountStr = localStorage.getItem('active_account');
        if (activeAccountStr) {
            const activeAccount = JSON.parse(activeAccountStr);
            currency = activeAccount?.currency || 'USD';
        }
    } catch (e) { /* ignore */ }
    if (currency === 'USD') {
        currency = client.accounts?.[loginId]?.currency || 'USD';
    }

    const appId = getAppId();

    const iframeSrc = token
        ? `https://deriv-dtrader.vercel.app/dtrader?acct1=${loginId}&token1=${token}&cur1=${currency}&lang=EN&app_id=${appId}`
        : `https://deriv-dtrader.vercel.app/dtrader`;

    return (
        <iframe
            key={token || 'guest'}
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
