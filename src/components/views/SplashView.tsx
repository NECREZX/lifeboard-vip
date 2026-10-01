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
          LATAR BELAKANG DUA WARNA DENGAN PEMISAH GARIS LURUS BIASA
          Atas (50%): #FF7777 (Menyatu dengan status bar HP)
          Bawah (50%): Putih #FFFFFF (Menyatu dengan navigasi sistem HP)
          ======================================================== */}
      {/* Bagian Atas: #FF7777 */}
      <div className="absolute inset-x-0 top-0 h-[50%] bg-[#FF7777]" />

      {/* Bagian Bawah: Putih #FFFFFF */}
      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-white" />

      {/* ========================================================
          KONTEN UTAMA:
          1. Logo tepat di garis pembatas 50% layar:
             - Setengah atas di #FF7777, setengah bawah di Putih
             - Garis lurus melintas pas di tengah badan logo
             - Border tebal warna hitam pekat (border-4 border-black)
          2. Tulisan "Lifeboard":
             - Berada di bawah logo (100% di area Putih)
          3. Ornamen Songket / Batik Tradisional Lurus di Bawah:
             - Motif horizontal lurus langsung di bawah tulisan Lifeboard
             - Dihiasi motif songket belah ketupat, pucuk rebung, dan bintang tengah ⭐
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

          {/* Tulisan Lifeboard & Ornamen Songket Horizontal Lurus */}
          <div className="relative flex flex-col items-center -mt-2">
            {/* Teks Lifeboard */}
            <h1 className="text-3xl sm:text-4xl font-black text-[#FF7777] tracking-wider z-10 drop-shadow-xs px-3 select-none">
              Lifeboard
            </h1>

            {/* Motif Garis Songket / Batik Tradisional Lurus Tepat di Bawah Tulisan */}
            <div className="w-[260px] sm:w-[290px] mt-2.5 sm:mt-3 pointer-events-none">
              <svg 
                viewBox="0 0 280 28" 
                className="w-full h-auto text-[#FF7777]" 
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Desain Sayap Songket Kiri (Pucuk Rebung & Belah Ketupat Tenun Songket) */}
                  <g id="songket-wing">
                    {/* Garis rel tenun songket atas dan bawah */}
                    <line x1="60" y1="9" x2="8" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="60" y1="19" x2="8" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    
                    {/* Jahitan sulam tenun putus-putus di tengah */}
                    <line x1="58" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3,3" strokeLinecap="round" />

                    {/* Ujung ornamen tenun songket (Titik aksen runcing) */}
                    <circle cx="5" cy="14" r="2.2" fill="currentColor" />
                    <circle cx="1" cy="14" r="1.2" fill="currentColor" />

                    {/* Motif Pucuk Rebung Songket (Piramida segitiga khas tenun Minang/Palembang) */}
                    <path d="M 68,7 L 75,14 L 68,21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 78,7 L 85,14 L 78,21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 88,8 L 94,14 L 88,20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Motif Belah Ketupat Bunga Tanjung Songket */}
                    <polygon points="106,14 113,7 120,14 113,21" fill="currentColor" />
                    <circle cx="113" cy="14" r="2" fill="white" />

                    {/* Titik penghubung ke bintang pusat */}
                    <circle cx="125" cy="14" r="1.8" fill="currentColor" />
                  </g>
                </defs>

                {/* Sayap Songket Kiri */}
                <use href="#songket-wing" />

                {/* Sayap Songket Kanan (Refleksi Simetris Presisi) */}
                <use href="#songket-wing" transform="translate(280, 0) scale(-1, 1)" />

                {/* Bunga Bintang Songket di Tengah ⭐ */}
                <polygon 
                  points="140,4 142.8,11.5 150.5,12.2 144.8,17.2 146.5,25 140,21 133.5,25 135.2,17.2 129.5,12.2 137.2,11.5" 
                  fill="currentColor" 
                />

                {/* Aksen intan kecil di atas & bawah bintang */}
                <polygon points="140,0 141.5,2 140,4 138.5,2" fill="currentColor" />
                <polygon points="140,24 141.5,26 140,28 138.5,26" fill="currentColor" />
              </svg>
            </div>
          </div>
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
