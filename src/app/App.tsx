import { lazy, Suspense } from 'react';
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import LocalStorageSyncWrapper from '@/components/localStorage-sync-wrapper';
import RoutePromptDialog from '@/components/route-prompt-dialog';
import { useAccountSwitching } from '@/hooks/useAccountSwitching';
import { useLanguageFromURL } from '@/hooks/useLanguageFromURL';
import { StoreProvider } from '@/hooks/useStore';
import CallbackPage from '@/pages/callback';
import { initializeI18n, localize, TranslationProvider } from '@deriv-com/translations';
import { isNewLoggedIn, createNewWebSocket } from '@/auth/NewDerivAuth';
import CoreStoreProvider from './CoreStoreProvider';
import './app-root.scss';

const Layout = lazy(() => import('../components/layout'));
const AppRoot = lazy(() => import('./app-root'));

const i18nInstance = initializeI18n({ cdnUrl: '' });

const LanguageHandler = ({ children }: { children: React.ReactNode }) => {
    useLanguageFromURL();
    return <>{children}</>;
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path='/'
            element={
                <Suspense
                    fallback={<ChunkLoader message={localize('Please wait while we connect to the server...')} />}
                >
                    <TranslationProvider defaultLang='EN' i18nInstance={i18nInstance}>
                        <LanguageHandler>
                            <StoreProvider>
                                <LocalStorageSyncWrapper>
                                    <RoutePromptDialog />
                                    <CoreStoreProvider>
                                        <Layout />
                                    </CoreStoreProvider>
                                </LocalStorageSyncWrapper>
                            </StoreProvider>
                        </LanguageHandler>
                    </TranslationProvider>
                </Suspense>
            }
            errorElement={
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1>Application Error</h1>
                    <p>Something went wrong. Please check the console for more details.</p>
                    <button onClick={() => window.location.reload()}>Reload Page</button>
                </div>
            }
        >
            <Route index element={<AppRoot />} />
            <Route path='callback' element={<CallbackPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
    )
);

function App() {
    useAccountSwitching();

    React.useEffect(() => {
        if (isNewLoggedIn() && !window._newSystemWSReady) {
            console.log('[APP] New auth user detected, connecting WebSocket');
            createNewWebSocket();
        }
    }, []);

    return <RouterProvider router={router} />;
}

export default App;
