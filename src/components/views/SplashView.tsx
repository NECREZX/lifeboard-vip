import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashView = ({ onFinish }: { onFinish: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onFinish(), 600);
    }, 1600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 overflow-hidden select-none bg-[#FF7777]"
        >
          {/* ========================================================
              LATAR BELAKANG DUA WARNA
              Atas: #FF7777
              Bawah: Putih #FFFFFF
              Pemisah: Gelombang murni biasa (ke bawah satu, ke atas satu),
              tanpa efek pudar tipis, tepat membelah di tengah layar (50%)
              ======================================================== */}
          <div className="absolute inset-x-0 -bottom-32 top-[calc(50%-60px)] flex flex-col pointer-events-none z-0">
            {/* SVG Gelombang Biasa (Tinggi 120px, garis tengah y=60 pas di 50% layar) */}
            <svg 
              className="w-full h-[120px] shrink-0 block" 
              viewBox="0 0 1440 120" 
              preserveAspectRatio="none" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Gelombang ke bawah satu lalu ke atas satu, polos tanpa filter/pudar */}
              <path 
                d="M 0,60 C 240,110 480,110 720,60 C 960,10 1200,10 1440,60 L 1440,120 L 0,120 Z" 
                fill="#FFFFFF" 
              />
            </svg>

            {/* Background Putih Solid sampai ke batas navigasi bawah HP */}
            <div className="w-full bg-white flex-1" />
          </div>

          {/* ========================================================
              KONTEN UTAMA:
              1. Logo tepat di tengah (50% layar):
                 - Setengah bagian atas di latar #FF7777
                 - Setengah bagian bawah di latar Putih
                 - Gelombang melintas tepat di tengah badan logo
              2. Tulisan "Lifeboard":
                 - Berada di bawah logo (sudah 100% di area Putih)
                 - Berwarna #FF7777 agar sangat jelas dan serasi
              ======================================================== */}
          <div className="absolute inset-0 z-10 flex flex-col items-center pointer-events-none">
            {/* Titik jangkar tepat di 50% layar */}
            <motion.div 
              initial={{ y: 16, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[50%] left-0 right-0 flex flex-col items-center"
            >
              {/* 
                Icon Logo (80px x 80px):
                Dengan -translate-y-1/2, titik tengah icon pas di 50% layar.
                Setengah atas di #FF7777, setengah bawah di Putih.
              */}
              <div className="-translate-y-1/2 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl p-1 bg-white border-4 border-black shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex items-center justify-center">
                  <img 
                    src="/icon.svg" 
                    className="w-full h-full object-cover scale-[1.15]" 
                    alt="Lifeboard Logo" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </div>

              {/* Tulisan Lifeboard: Berada di bawah logo (100% di area latar putih) */}
              <h1 className="text-3xl sm:text-4xl font-black text-[#FF7777] tracking-tight mt-1 sm:mt-2 drop-shadow-xs">
                Lifeboard
              </h1>
            </motion.div>

            {/* Spinner Loading di bagian bawah layar (Area Putih) */}
            <div 
              className="absolute bottom-8 sm:bottom-10 flex flex-col items-center"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
            >
              <div className="w-7 h-7 border-3 border-[#FF7777]/25 border-t-[#FF7777] rounded-full animate-spin" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
