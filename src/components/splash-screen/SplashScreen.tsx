import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './SplashScreen.scss';

const DURATION_MS = 5000;

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

    useEffect(() => {
        const holdTimer = setTimeout(() => setPhase('hold'), 600);
        const outTimer = setTimeout(() => setPhase('out'), DURATION_MS - 600);
        const doneTimer = setTimeout(onComplete, DURATION_MS);
        return () => {
            clearTimeout(holdTimer);
            clearTimeout(outTimer);
            clearTimeout(doneTimer);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase !== 'out' ? (
                <motion.div
                    className='splash'
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                >
                    <div className='splash__grid' />
                    <div className='splash__scan' />

                    <div className='splash__particles'>
                        {Array.from({ length: 22 }).map((_, i) => (
                            <span key={i} className='splash__particle' style={{ '--i': i } as React.CSSProperties} />
                        ))}
                    </div>

                    <motion.div
                        className='splash__center'
                        initial={{ opacity: 0, scale: 0.82, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                    >
                        <div className='splash__glow-ring' />
                        <div className='splash__glow-ring splash__glow-ring--2' />

                        <motion.div
                            className='splash__logo-wrap'
                            animate={{ boxShadow: ['0 0 30px #ffd70055', '0 0 70px #ffd700aa', '0 0 30px #ffd70055'] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <img src='/splash-logo.png' alt='PoundPrint Pro' className='splash__logo' />
                            <div className='splash__logo-scanline' />
                        </motion.div>

                        <motion.div
                            className='splash__tagline'
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                        >
                            <span className='splash__tagline-dot' />
                            <span>INITIALISING TRADING ENGINE</span>
                            <span className='splash__tagline-dot' />
                        </motion.div>

                        <motion.div
                            className='splash__bar-track'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                        >
                            <motion.div
                                className='splash__bar-fill'
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: (DURATION_MS - 1200) / 1000, ease: 'linear', delay: 1.0 }}
                            />
                            <div className='splash__bar-glint' />
                        </motion.div>

                        <motion.p
                            className='splash__quote'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 1, 0] }}
                            transition={{ times: [0, 0.15, 0.85, 1], duration: 3.2, delay: 1.2 }}
                        >
                            &ldquo;Nothing changes unless you work for it.&rdquo;
                        </motion.p>
                    </motion.div>

                    <div className='splash__corner splash__corner--tl' />
                    <div className='splash__corner splash__corner--tr' />
                    <div className='splash__corner splash__corner--bl' />
                    <div className='splash__corner splash__corner--br' />
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

export default SplashScreen;
