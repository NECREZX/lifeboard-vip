/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BannerStyle, CardRadius } from '../types';

interface BannerShapeDividerProps {
  style?: BannerStyle;
  color: string;
  cardRadius?: CardRadius;
  className?: string;
}

/**
 * BannerShapeDivider
 * 
 * Menampilkan siluet/gaya dekoratif presisi pada batas bawah hero banner
 * dengan batas atas card pembungkus, dilengkapi aksen lis emas ganda elegan
 * sesuai contoh referensi yang diberikan pengguna.
 * 
 * ATURAN KETAT:
 * Hanya aktif jika setelan 'Sudut Elemen & Card' adalah 'sharp' (Tajam).
 * Jika sudut adalah 'rounded' atau 'extra', komponen ini mengembalikan `null`
 * untuk memastikan tidak bertabrakan dengan sudut melengkung card pembungkus.
 */
export const BannerShapeDivider: React.FC<BannerShapeDividerProps> = ({
  style = 'straight',
  color,
  cardRadius,
  className = ''
}) => {
  // Hanya aktif jika setelan sudut adalah 'sharp' (Tajam)
  const isSharp = cardRadius === 'sharp';
  
  if (!isSharp) {
    return null;
  }

  // Normalisasi & fallback compatibility
  const resolvedStyle = 
    style === 'crown' || style === 'slant' ? 'stepped' :
    style === 'facet' || style === 'chevron' ? 'chamfer' :
    (style || 'straight');

  const effectiveStyle = resolvedStyle;

  // Posisi presisi selaras dengan margin-top negatif (-mt) card pembungkus
  // (Dashboard, Kelola, Tambah Data, Lifeboard AI):
  // Mobile: -mt-[36px] -> top: -36px
  // Tablet: -mt-[88px] -> top: -88px
  // Desktop: -mt-[96px] -> top: -96px
  const positionClasses = 'top-[-36px] sm:top-[-88px] lg:top-[-96px]';

  return (
    <div className={`relative z-20 pointer-events-none -mx-4 sm:-mx-6 h-0 overflow-visible ${className}`}>
      <div className={`absolute left-0 right-0 w-full ${positionClasses}`}>
        {/* Gaya 1: Lengkung Bawah (Melengkung Dalam Sesuai Contoh Gambar 2 + Lis Emas Ganda) */}
        {effectiveStyle === 'curve' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 56"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Lengkung Bawah Dalam */}
            <path
              d="M 0 0 L 1200 0 L 1200 6 Q 600 54 0 6 Z"
              fill={color}
            />
            {/* Garis Lis Emas Utama */}
            <path
              d="M 0 6 Q 600 54 1200 6"
              fill="none"
              stroke="#E5B869"
              strokeWidth="2.5"
            />
            {/* Garis Lis Emas Paralel Dalam */}
            <path
              d="M 0 1 Q 600 48 1200 1"
              fill="none"
              stroke="#E5B869"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>
        )}

        {/* Gaya 2: Bertingkat (Geometric Steps Sesuai Contoh Gambar 1 Kiri + Lis Emas Ganda) */}
        {effectiveStyle === 'stepped' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 56"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Tangga Geometris Bertingkat */}
            <path
              d="M 0 0 L 1200 0 L 1200 6 L 1000 6 L 1000 24 L 800 24 L 800 48 L 400 48 L 400 24 L 200 24 L 200 6 L 0 6 Z"
              fill={color}
            />
            {/* Garis Lis Emas Luar */}
            <path
              d="M 0 6 L 200 6 L 200 24 L 400 24 L 400 48 L 800 48 L 800 24 L 1000 24 L 1000 6 L 1200 6"
              fill="none"
              stroke="#E5B869"
              strokeWidth="2.5"
            />
            {/* Garis Lis Emas Paralel Dalam */}
            <path
              d="M 0 1 L 206 1 L 206 19 L 406 19 L 406 43 L 794 43 L 794 19 L 994 19 L 994 1 L 1200 1"
              fill="none"
              stroke="#E5B869"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>
        )}

        {/* Gaya 3: Gelombang Wave (Simetris Matematis Rapih + Lis Emas Ganda) */}
        {effectiveStyle === 'wave' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 56"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Ombak Simetris Matematis Sempurna */}
            <path
              d="M 0 0 L 1200 0 L 1200 14 C 1060 14, 1040 36, 900 36 C 760 36, 740 14, 600 14 C 460 14, 440 36, 300 36 C 160 36, 140 14, 0 14 Z"
              fill={color}
            />
            {/* Garis Lis Emas Luar */}
            <path
              d="M 0 14 C 140 14, 160 36, 300 36 C 440 36, 460 14, 600 14 C 740 14, 760 36, 900 36 C 1040 36, 1060 14, 1200 14"
              fill="none"
              stroke="#E5B869"
              strokeWidth="2.5"
            />
            {/* Garis Lis Emas Paralel Dalam */}
            <path
              d="M 0 9 C 140 9, 160 31, 300 31 C 440 31, 460 9, 600 9 C 740 9, 760 31, 900 31 C 1040 31, 1060 9, 1200 9"
              fill="none"
              stroke="#E5B869"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>
        )}

        {/* Gaya 4: Chamfer 4 Titik Sudut (Trapesium 4 Sudut Persis Gambar 1 Kanan + Lis Emas Ganda) */}
        {effectiveStyle === 'chamfer' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 56"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Melengkung Kebawah dengan 4 Titik Sudut Tegas */}
            <path
              d="M 0 0 L 1200 0 L 1200 6 L 940 48 L 260 48 L 0 6 Z"
              fill={color}
            />
            {/* Garis Lis Emas Luar */}
            <path
              d="M 0 6 L 260 48 L 940 48 L 1200 6"
              fill="none"
              stroke="#E5B869"
              strokeWidth="2.5"
            />
            {/* Garis Lis Emas Paralel Dalam */}
            <path
              d="M 0 1 L 262 43 L 938 43 L 1200 1"
              fill="none"
              stroke="#E5B869"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>
        )}

        {/* Gaya 5: Datar Presisi (Lis Emas Ganda) */}
        {effectiveStyle === 'straight' && (
          <svg
            className="w-full h-3 sm:h-4 lg:h-4.5 block drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
            viewBox="0 0 1200 12"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Datar */}
            <rect x="0" y="0" width="1200" height="6" fill={color} />
            {/* Garis Lis Emas Luar */}
            <line x1="0" y1="6" x2="1200" y2="6" stroke="#E5B869" strokeWidth="2.5" />
            {/* Garis Lis Emas Paralel Dalam */}
            <line x1="0" y1="1" x2="1200" y2="1" stroke="#E5B869" strokeOpacity="0.75" strokeWidth="1.2" />
          </svg>
        )}
      </div>
    </div>
  );
};
