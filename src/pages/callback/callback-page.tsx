import { useEffect } from 'react';
import SSOLoader from '@/components/sso-loader/sso-loader';
import { clearCSRFToken, validateCSRFToken } from '@/components/shared/utils/config/config';
import { OAuthTokenExchangeService } from '@/services/oauth-token-exchange.service';
import { clearAuthData } from '@/utils/auth-utils';

const CallbackPage = () => {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            console.error('[Callback] OAuth error:', error);
            window.location.replace('/');
            return;
        }

        if (!state) {
            console.error('[Callback] Missing state parameter');
            clearAuthData();
            window.location.replace('/');
            return;
        }

        if (!validateCSRFToken(state)) {
            console.error('[Callback] CSRF token validation failed');
            clearAuthData();
            window.location.replace('/');
            return;
        }

        clearCSRFToken();

        if (!code) {
            console.error('[Callback] Missing authorization code');
            window.location.replace('/');
            return;
        }

        OAuthTokenExchangeService.exchangeCodeForToken(code)
            .then(response => {
                if (response.access_token) {
                    window.location.replace('/');
                } else {
                    console.error('[Callback] Token exchange failed:', response.error);
                    window.location.replace('/');
                }
            })
            .catch(err => {
                console.error('[Callback] Token exchange request failed:', err);
                window.location.replace('/');
            });
    }, []);

    return <SSOLoader />;
};

export default CallbackPage;
