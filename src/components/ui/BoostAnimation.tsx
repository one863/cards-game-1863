import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdFlashOn } from 'react-icons/md';

interface BoostAnimationProps {
    active: boolean;
    val: number;
    side: 'player' | 'opponent';
    onComplete: () => void;
}

const BoostAnimation: React.FC<BoostAnimationProps> = ({ active, val, side, onComplete }) => {
    return (
        <AnimatePresence>
            {active && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onAnimationComplete={() => {
                        setTimeout(onComplete, 1500);
                    }}
                    className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                >
                    {/* Overlay Flash - Utilise tween par défaut */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0] }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={`absolute inset-0 ${side === 'player' ? 'bg-[#afff34]' : 'bg-red-500'}`}
                    />

                    {/* Central Content */}
                    <motion.div 
                        initial={{ scale: 0, rotate: -20, opacity: 0 }}
                        animate={{ 
                            scale: [0, 1.1, 1], 
                            rotate: [10, -5, 0],
                            opacity: 1 
                        }}
                        exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
                        transition={{ duration: 0.4, ease: "easeOut" }} // CHANGÉ : suppression de spring pour éviter le crash
                        className="relative flex flex-col items-center"
                    >
                        {/* Glow Behind */}
                        <div className={`absolute inset-0 blur-[100px] opacity-60 rounded-full ${side === 'player' ? 'bg-[#afff34]' : 'bg-red-500'}`}></div>

                        <div className={`
                            px-12 py-6 rounded-3xl border-4 flex flex-col items-center gap-2
                            ${side === 'player' 
                                ? 'bg-[#afff34] text-black border-white shadow-[0_0_60px_rgba(175,255,52,0.8)]' 
                                : 'bg-red-600 text-white border-white shadow-[0_0_60px_rgba(239,68,68,0.8)]'}
                        `}>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            >
                                <MdFlashOn size={80} />
                            </motion.div>
                            <span className="text-6xl font-black italic tracking-tighter">BOOST +{val}</span>
                            <span className="text-xs font-bold uppercase tracking-[0.4em] opacity-80">Power Surge</span>
                        </div>

                        {/* Particle Effects */}
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                animate={{ 
                                    x: (Math.random() - 0.5) * 300, 
                                    y: (Math.random() - 0.5) * 300, 
                                    opacity: 0,
                                    scale: 0 
                                }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className={`absolute w-3 h-3 rounded-full ${side === 'player' ? 'bg-[#afff34]' : 'bg-red-500'}`}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BoostAnimation;
