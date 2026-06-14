import React, { useEffect, useState, useRef } from 'react';
import { handleNewCallback } from '@/auth/NewDerivAuth';

/* ─────────────────────────────────────────────────────────
   NEW SYSTEM CALLBACK — handles new Deriv OAuth2 PKCE redirects
   (/callback?code=... from auth.deriv.com)
   ───────────────────────────────────────────────────────── */
const NewSystemCallbackHandler = () => {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMsg, setErrorMsg] = useState('');
    const attempted = useRef(false);

    useEffect(() => {
        console.log('[CALLBACK] NewSystemCallbackHandler mounted');
        console.log('[CALLBACK] URL:', window.location.search);
        if (attempted.current) return;
        attempted.current = true;

        const run = async () => {
            try {
                const token = await handleNewCallback();
                if (token) {
                    setStatus('success');
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    window.location.href = '/';
                }
            } catch (err: any) {
                console.error('[CALLBACK] Error:', err.message);
                setErrorMsg(err.message);
                setStatus('error');
            }
        };

        run();
    }, []);

    if (status === 'error') {
        return (
            <div style={{ padding: '40px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
                <h2 style={{ color: '#e74c3c', marginBottom: '16px' }}>Login failed</h2>
                <p
                    style={{
                        color: '#ccc',
                        margin: '16px 0',
                        whiteSpace: 'pre-wrap',
                        textAlign: 'left',
                        background: '#1a1a1a',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                    }}
                >
                    {errorMsg}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '8px 20px', cursor: 'pointer' }}
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => { window.location.href = '/'; }}
                        style={{ padding: '8px 20px', cursor: 'pointer' }}
                    >
                        Return to App
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#10b981', fontSize: '16px' }}>Login successful! Redirecting…</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px' }}>Completing login, please wait…</p>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   Root callback router — picks the right handler based on URL params.
   ───────────────────────────────────────────────────────── */
const CallbackPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasCode = urlParams.has('code');
    const hasOldTokens = urlParams.has('token1') || urlParams.has('acct1');

    if (hasCode && !hasOldTokens) {
        return <NewSystemCallbackHandler />;
    }

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Redirecting…</p>
        </div>
    );
};

export default CallbackPage;
