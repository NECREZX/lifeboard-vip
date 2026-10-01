import React, { useEffect } from 'react';

export const SplashView = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    // Selesai loading langsung tampilkan form login seketika tanpa jeda/delay kosong
    const timer = setTimeout(() => {
      onFinish();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* ========================================================
          LATAR BELAKANG DUA WARNA DENGAN PEMISAH GARIS BIASA (LURUS)
          Atas (50%): #FF7777 (Menyatu dengan status bar HP)
          Bawah (50%): Putih #FFFFFF (Menyatu dengan navigasi sistem HP)
          Pemisah: Garis lurus biasa tepat membelah di tengah layar (50%)
          ======================================================== */}
      {/* Bagian Atas: #FF7777 */}
      <div className="absolute inset-x-0 top-0 h-[50%] bg-[#FF7777]" />

      {/* Bagian Bawah: Putih #FFFFFF */}
      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-white" />

      {/* ========================================================
          KONTEN UTAMA:
          1. Logo tepat di tengah (garis pembatas 50% layar):
             - Setengah atas di #FF7777
             - Setengah bawah di Putih
             - Garis lurus melintas pas di tengah badan logo
             - Border tebal warna hitam pekat (border-4 border-black)
          2. Tulisan "Lifeboard":
             - Tepat di bawah logo (100% di area Putih)
             - Warna #FF7777 tajam dan tebal
          ======================================================== */}
      <div className="absolute inset-0 z-10 flex flex-col items-center pointer-events-none">
        {/* Titik jangkar tepat di garis pembatas 50% layar */}
        <div className="absolute top-[50%] left-0 right-0 flex flex-col items-center">
          {/* 
            Icon Logo (80px x 80px):
            -translate-y-1/2 menempatkan titik tengah icon pas di garis 50%.
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
        </div>

        {/* Spinner Loading di bagian bawah layar (Area Putih) */}
        <div 
          className="absolute bottom-8 sm:bottom-10 flex flex-col items-center"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
        >
          <div className="w-7 h-7 border-3 border-[#FF7777]/25 border-t-[#FF7777] rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};
