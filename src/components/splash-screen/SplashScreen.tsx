import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashLogo from './splash-logo.png';
import './SplashScreen.scss';

const TOTAL_MS = 10000;

/* ─── tiny helpers ─────────────────────────────────── */
const DataStream = ({ col }: { col: number }) => {
    const chars = '£$€01トレード∞⬡⟁⊕⌬∆◈░▒▓█POUNDPRINT'.split('');
    return (
        <div className='ss-stream' style={{ left: `${col}%`, animationDuration: `${2.4 + (col % 7) * 0.31}s`, animationDelay: `${(col % 9) * 0.15}s` }}>
            {chars.map((c, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.07}s` }}>{c}</span>
            ))}
        </div>
    );
};

const HexGrid = () => (
    <svg className='ss-hexgrid' viewBox='0 0 200 200' preserveAspectRatio='xMidYMid slice'>
        {Array.from({ length: 40 }).map((_, i) => {
            const cx = (i % 8) * 28 + ((Math.floor(i / 8) % 2) ? 14 : 0) + 4;
            const cy = Math.floor(i / 8) * 26 + 10;
            return <polygon key={i} className='ss-hex' points={`${cx},${cy-10} ${cx+8.7},${cy-5} ${cx+8.7},${cy+5} ${cx},${cy+10} ${cx-8.7},${cy+5} ${cx-8.7},${cy-5}`} style={{ animationDelay: `${i * 0.06}s` }} />;
        })}
    </svg>
);

const Sparks = () => (
    <div className='ss-sparks'>
        {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className='ss-spark' style={{ '--angle': `${i * 12}deg`, '--dist': `${120 + (i % 4) * 40}px`, animationDelay: `${3 + (i % 6) * 0.18}s` } as React.CSSProperties} />
        ))}
    </div>
);

/* ─── main component ───────────────────────────────── */
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [phase, setPhase] = useState<'show' | 'exit'>('show');
    const [progress, setProgress] = useState(0);
    const rafRef = useRef<number>(0);
    const startRef = useRef<number>(0);

    useEffect(() => {
        startRef.current = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startRef.current;
            setProgress(Math.min(elapsed / TOTAL_MS, 1));
            if (elapsed < TOTAL_MS - 800) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setPhase('exit');
                setTimeout(onComplete, 800);
            }
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [onComplete]);

    const QUOTE_WORDS = ['Nothing', 'changes', 'unless', 'you', 'work', 'for', 'it.'];
    const BRAND_LETTERS = ['P','O','U','N','D','P','R','I','N','T'];

    return (
        <AnimatePresence>
            {phase !== 'exit' ? (
                <motion.div
                    className='ss'
                    key='splash'
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                >
                    {/* ── ambient background ── */}
                    <HexGrid />
                    <div className='ss-grid' />
                    <div className='ss-vignette' />

                    {/* matrix data streams */}
                    <div className='ss-streams'>
                        {[4,10,17,24,31,38,46,53,60,67,74,81,88,95].map(c => (
                            <DataStream key={c} col={c} />
                        ))}
                    </div>

                    {/* ── scan beam ── */}
                    <motion.div
                        className='ss-beam'
                        animate={{ top: ['-1%', '101%'] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear', delay: 0.4 }}
                    />

                    {/* ── HUD corner brackets ── */}
                    {(['tl','tr','bl','br'] as const).map(pos => (
                        <motion.div
                            key={pos}
                            className={`ss-corner ss-corner--${pos}`}
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, ease: 'backOut' }}
                        />
                    ))}

                    {/* ── CENTER STAGE ── */}
                    <div className='ss-stage'>

                        {/* Captain badge area — top-left overlay */}
                        <motion.div
                            className='ss-badge'
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.6, duration: 0.6, ease: 'backOut' }}
                        >
                            <div className='ss-badge__ring' />
                            <span className='ss-badge__text'>CAPTAIN PETER MUNG&apos;ANYI</span>
                        </motion.div>

                        {/* Quote reveal — word by word */}
                        <motion.div className='ss-quote' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.4 }}>
                            <span className='ss-quote__mark'>&ldquo;</span>
                            {QUOTE_WORDS.map((word, i) => (
                                <motion.span
                                    key={i}
                                    className='ss-quote__word'
                                    initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    transition={{ delay: 1.9 + i * 0.14, duration: 0.45, ease: 'backOut' }}
                                >
                                    {word}{' '}
                                </motion.span>
                            ))}
                            <span className='ss-quote__mark'>&rdquo;</span>
                        </motion.div>

                        {/* Main image — chromatic-aberration reveal */}
                        <div className='ss-logo-outer'>
                            <motion.div
                                className='ss-logo-frame'
                                initial={{ filter: 'blur(14px) brightness(0.2)', scale: 0.88 }}
                                animate={{ filter: 'blur(0px) brightness(1)', scale: 1 }}
                                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                            >
                                {/* RGB ghost layers for chromatic aberration */}
                                <motion.img src={SplashLogo} alt='' className='ss-logo-ghost ss-logo-ghost--r' initial={{ opacity: 0.55, x: -7 }} animate={{ opacity: 0, x: 0 }} transition={{ delay: 0.5, duration: 1.0 }} aria-hidden />
                                <motion.img src={SplashLogo} alt='' className='ss-logo-ghost ss-logo-ghost--b' initial={{ opacity: 0.55, x: 7 }}  animate={{ opacity: 0, x: 0 }} transition={{ delay: 0.5, duration: 1.0 }} aria-hidden />
                                <img src={SplashLogo} alt='PoundPrint Pro' className='ss-logo-main' />
                                {/* scanline overlay */}
                                <div className='ss-logo-scanlines' />
                                {/* shine sweep */}
                                <motion.div
                                    className='ss-logo-shine'
                                    initial={{ left: '-60%' }}
                                    animate={{ left: ['-60%', '160%'] }}
                                    transition={{ delay: 1.8, duration: 0.9, ease: 'easeInOut' }}
                                />
                            </motion.div>

                            {/* animated gold border */}
                            <motion.div
                                className='ss-logo-border'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.4, duration: 0.6 }}
                            />
                            <Sparks />
                        </div>

                        {/* BRAND lettermark reveal */}
                        <div className='ss-brand'>
                            {BRAND_LETTERS.map((letter, i) => (
                                <motion.span
                                    key={i}
                                    className={`ss-brand__letter ${i >= 5 ? 'ss-brand__letter--accent' : ''}`}
                                    initial={{ opacity: 0, y: -30, rotateX: 90 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    transition={{ delay: 3.2 + i * 0.07, duration: 0.5, ease: 'backOut' }}
                                >
                                    {letter}
                                </motion.span>
                            ))}
                            <motion.span
                                className='ss-brand__pro'
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 4.0, duration: 0.4, type: 'spring', bounce: 0.5 }}
                            >
                                .PRO
                            </motion.span>
                        </div>

                        {/* Maziwa tagline */}
                        <motion.div
                            className='ss-maziwa'
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 4.4, duration: 0.6, ease: 'backOut' }}
                        >
                            <span className='ss-maziwa__line' />
                            Maziwa is about to be milked&nbsp;
                            <span className='ss-maziwa__emoji'>🥛🥛</span>
                            <span className='ss-maziwa__line' />
                        </motion.div>

                        {/* status + progress */}
                        <motion.div
                            className='ss-status'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 5.0 }}
                        >
                            <div className='ss-status__label'>
                                <span className='ss-status__dot' />
                                <span>INITIALISING TRADING ENGINE</span>
                                <span className='ss-status__dot' />
                            </div>
                            <div className='ss-progress'>
                                <motion.div
                                    className='ss-progress__fill'
                                    style={{ width: `${progress * 100}%` }}
                                />
                                <div className='ss-progress__head' style={{ left: `calc(${progress * 100}% - 6px)` }} />
                            </div>
                            <div className='ss-status__pct'>{Math.floor(progress * 100)}%</div>
                        </motion.div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

export default SplashScreen;
