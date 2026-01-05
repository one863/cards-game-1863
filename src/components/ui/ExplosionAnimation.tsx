import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExplosionAnimationProps {
  active: boolean;
  onComplete: () => void;
}

const ExplosionAnimation: React.FC<ExplosionAnimationProps> = ({ active, onComplete }) => {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.5, 1.2],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <span className="text-9xl filter drop-shadow-[0_0_30px_rgba(255,165,0,0.8)]">💥</span>
            
            {/* Particules */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: 0,
                  scale: 0
                }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="absolute top-1/2 left-1/2 w-4 h-4 bg-orange-500 rounded-full"
                style={{ transform: 'translate(-50%, -50%)' }}
              />
            ))}
            
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400 rounded-full blur-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExplosionAnimation;
