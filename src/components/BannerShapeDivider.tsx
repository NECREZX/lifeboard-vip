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
  overlap?: 'default' | 'auth';
}

/**
 * BannerShapeDivider
 * 
 * Menampilkan siluet/gaya dekoratif presisi pada batas bawah hero banner
 * dengan batas atas card pembungkus, dilengkapi aksen garis emas elegan sesuai contoh gambar.
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
  className = '',
  overlap = 'default'
}) => {
  // Hanya aktif jika setelan sudut adalah 'sharp' (Tajam)
  const isSharp = cardRadius === 'sharp';
  
  // Normalisasi & fallback compatibility
  const resolvedStyle = 
    style === 'crown' || style === 'slant' ? 'stepped' :
    style === 'facet' || style === 'chevron' ? 'chamfer' :
    (style || 'straight');

  const effectiveStyle = isSharp ? resolvedStyle : 'straight';

  if (!isSharp || effectiveStyle === 'straight') {
    return null;
  }

  // Posisi presisi selaras dengan margin-top negatif (-mt) card pembungkus:
  // - default (Dashboard, Kelola, Tambah Data, Lifeboard AI):
  //   Mobile: -mt-[36px] -> top: -36px
  //   Tablet: -mt-[88px] -> top: -88px
  //   Desktop: -mt-[96px] -> top: -96px
  // - auth (AuthView):
  //   Mobile: -mt-8 (32px) -> top: -32px
  //   Tablet/Desktop: -mt-10 (40px) -> top: -40px
  const positionClasses = overlap === 'auth'
    ? 'top-[-32px] sm:top-[-40px]'
    : 'top-[-36px] sm:top-[-88px] lg:top-[-96px]';

  return (
    <div className={`relative z-20 pointer-events-none -mx-4 sm:-mx-6 h-0 overflow-visible ${className}`}>
      <div className={`absolute left-0 right-0 w-full ${positionClasses}`}>
        {/* Gaya 1: Lengkung Bawah (Melengkung Dalam Sesuai Contoh Gambar 2 + Garis Aksen Emas) */}
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
            {/* Garis Aksen Emas Utama */}
            <path
              d="M 0 6 Q 600 54 1200 6"
              fill="none"
              stroke="#E5B869"
              strokeWidth="2.5"
            />
            {/* Garis Aksen Emas Paralel Dalam */}
            <path
              d="M 0 1 Q 600 48 1200 1"
              fill="none"
              stroke="#E5B869"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>
        )}

        {/* Gaya 2: Bertingkat (Geometric Steps Sesuai Contoh Gambar 1 Kiri + Garis Aksen Emas) */}
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
            {/* Garis Aksen Emas Luar */}
            <path
              d="M 0 6 L 200 6 L 200 24 L 400 24 L 400 48 L 800 48 L 800 24 L 1000 24 L 1000 6 L 1200 6"
              fill="none"
              stroke="#E5B869"
              strokeWidth="2.5"
            />
            {/* Garis Aksen Emas Paralel Dalam */}
            <path
              d="M 0 1 L 206 1 L 206 19 L 406 19 L 406 43 L 794 43 L 794 19 L 994 19 L 994 1 L 1200 1"
              fill="none"
              stroke="#E5B869"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>
        )}

        {/* Gaya 3: Gelombang Wave (Wave Halus Proporsional - Dikurangi Sedikit Ombaknya) */}
        {effectiveStyle === 'wave' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 56"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Ombak Halus Sedang */}
            <path
              d="M 0 0 L 1200 0 L 1200 10 C 1060 32, 980 34, 880 34 C 760 34, 700 14, 600 14 C 500 14, 440 32, 320 32 C 220 32, 140 10, 0 10 Z"
              fill={color}
            />
            {/* Garis Aksen Emas Luar */}
            <path
              d="M 0 10 C 140 10, 220 32, 320 32 C 440 32, 500 14, 600 14 C 700 14, 760 34, 880 34 C 980 34, 1060 32, 1200 10"
              fill="none"
              stroke="#E5B869"
              strokeWidth="2.5"
            />
            {/* Garis Aksen Emas Paralel Dalam */}
            <path
              d="M 0 5 C 140 5, 220 27, 320 27 C 440 27, 500 9, 600 9 C 700 9, 760 29, 880 29 C 980 29, 1060 27, 1200 5"
              fill="none"
              stroke="#E5B869"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>
        )}

        {/* Gaya 4: Chamfer Sudut (Potongan Miring Trapesium Sesuai Contoh Gambar 1 Kanan + Garis Aksen Emas) */}
        {effectiveStyle === 'chamfer' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 56"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Potongan Trapesium Sudut Chamfer */}
            <path
              d="M 0 0 L 1200 0 L 1200 6 L 1060 6 L 880 48 L 320 48 L 140 6 L 0 6 Z"
              fill={color}
            />
            {/* Garis Aksen Emas Luar */}
            <path
              d="M 0 6 L 140 6 L 320 48 L 880 48 L 1060 6 L 1200 6"
              fill="none"
              stroke="#E5B869"
              strokeWidth="2.5"
            />
            {/* Garis Aksen Emas Paralel Dalam */}
            <path
              d="M 0 1 L 144 1 L 322 43 L 878 43 L 1056 1 L 1200 1"
              fill="none"
              stroke="#E5B869"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
