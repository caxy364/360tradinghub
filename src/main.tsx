import { useState } from 'react';
import { configure } from 'mobx';
import ReactDOM from 'react-dom/client';
import 'react-dom/server'; // preload to prevent lazy-chunk factory error in bot-builder toolbox
import { AuthWrapper } from './app/AuthWrapper';
import SplashScreen from './components/splash-screen/SplashScreen';
// Removed AnalyticsInitializer import - analytics dependency removed
// See migrate-docs/ANALYTICS_IMPLEMENTATION_GUIDE.md for re-implementation
import { performVersionCheck } from './utils/version-check';
import './styles/index.scss';

// Configure MobX to handle multiple instances in production builds
configure({ isolateGlobalState: true });

// Perform version check FIRST - before any other operations
performVersionCheck();

// Removed AnalyticsInitializer() call - analytics dependency removed

const Root = () => {
    const [splashDone, setSplashDone] = useState(false);

    return (
        <>
            {/* App loads in background while splash is shown — no extra wait */}
            <AuthWrapper />
            {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
        </>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
