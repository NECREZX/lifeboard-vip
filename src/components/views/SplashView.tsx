import React, { useEffect, useState } from 'react';
import { Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashView = ({ onFinish }: { onFinish: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onFinish(), 600);
    }, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-gradient-to-br from-cyan-400 via-teal-500 to-rose-500 flex flex-col items-center justify-center z-50 text-white"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-[2rem] overflow-hidden mb-6 shadow-2xl border border-white/20 bg-transparent">
              <img src="/icon.svg" className="w-full h-full object-cover scale-[1.15]" alt="Lifeboard Logo" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Lifeboard</h1>
            <p className="text-white/90 text-xs text-center font-medium tracking-wide uppercase mt-1 max-w-[250px] leading-relaxed">Sistem Informasi Manajemen Keuangan dan Aktivitas</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-12 flex flex-col items-center"
          >
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
