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
 * Menampilkan siluet/gaya dekoratif mewah pada pertemuan batas bawah hero banner
 * dengan batas atas card pembungkus.
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
  
  // Normalisasi & fallback compatibility (slant -> crown, chevron -> facet)
  const resolvedStyle = 
    style === 'slant' ? 'crown' :
    style === 'chevron' ? 'facet' :
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
        {/* Gaya 1: Lengkung Bawah (Royal Bottom Arc) */}
        {effectiveStyle === 'curve' && (
          <svg
            className="w-full h-5 sm:h-7 lg:h-8 block drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
            viewBox="0 0 1200 52"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 0 L 1200 0 L 1200 4 Q 600 50 0 4 Z"
              fill={color}
            />
          </svg>
        )}

        {/* Gaya 2: Kubah Mahkota (Imperial Crown / Royal Ogee Arch Mewah) */}
        {effectiveStyle === 'crown' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 54"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Kubah Utama */}
            <path
              d="M 0 0 L 1200 0 L 1200 6 C 1060 6, 960 18, 860 18 C 750 18, 700 50, 600 50 C 500 50, 450 18, 340 18 C 240 18, 140 6, 0 6 Z"
              fill={color}
            />
            {/* Aksen Kilau Kubah Halus */}
            <path
              d="M 340 18 C 450 18, 500 50, 600 50 C 700 50, 750 18, 860 18"
              fill="none"
              stroke="white"
              strokeOpacity="0.22"
              strokeWidth="1.5"
            />
          </svg>
        )}

        {/* Gaya 3: Gelombang Wave (Fluid Deep Oceanic Wave - Jauh Lebih Bergelombang & Mengalir) */}
        {effectiveStyle === 'wave' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 54"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Ombak Utama dengan Amplitudo Dalam & Berirama */}
            <path
              d="M 0 0 L 1200 0 L 1200 16 C 1060 52, 940 54, 840 40 C 740 26, 700 6, 600 8 C 500 10, 420 52, 300 52 C 180 52, 100 8, 0 14 Z"
              fill={color}
            />
            {/* Aksen Puncak Ombak (Wave Crest Highlight) */}
            <path
              d="M 0 14 C 100 8, 180 52, 300 52 C 420 52, 500 10, 600 8 C 700 6, 740 26, 840 40 C 940 54, 1060 52, 1200 16"
              fill="none"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
          </svg>
        )}

        {/* Gaya 4: Facet Berlian (Royal Diamond Facet - Potongan Presisi Permata Mewah) */}
        {effectiveStyle === 'facet' && (
          <svg
            className="w-full h-6 sm:h-8 lg:h-9 block drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
            viewBox="0 0 1200 54"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Siluet Utama Potongan Berlian Bertingkat */}
            <path
              d="M 0 0 L 1200 0 L 1200 6 L 980 14 L 780 26 L 600 50 L 420 26 L 220 14 L 0 6 Z"
              fill={color}
            />
            {/* Facet Kaca/Permata Internal Tengah (Refleksi Cahaya Mewah) */}
            <polygon
              points="600,50 420,26 780,26"
              fill="white"
              fillOpacity="0.08"
            />
            {/* Garis Faset Geometris Berkilau */}
            <line
              x1="600"
              y1="50"
              x2="600"
              y2="26"
              stroke="white"
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
            <line
              x1="420"
              y1="26"
              x2="600"
              y2="50"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
            <line
              x1="780"
              y1="26"
              x2="600"
              y2="50"
              stroke="black"
              strokeOpacity="0.15"
              strokeWidth="1"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
