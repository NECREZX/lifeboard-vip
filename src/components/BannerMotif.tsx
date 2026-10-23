/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BannerMotif } from '../types';

interface BannerMotifOverlayProps {
  motif?: BannerMotif;
  idPrefix?: string;
  className?: string;
}

export const BannerMotifOverlay: React.FC<BannerMotifOverlayProps> = ({
  motif = 'songket',
  idPrefix = 'banner',
  className = 'w-full h-full opacity-45 mix-blend-overlay pointer-events-none'
}) => {
  if (motif === 'polos') {
    return null;
  }

  // Graceful fallback for legacy names if present in user localStorage
  const resolvedMotif = 
    motif === 'dots' ? 'kawung' :
    motif === 'stripes' ? 'damask' :
    motif === 'artdeco' ? 'damask' :
    motif === 'hexagon' ? 'moroccan' :
    motif;

  const patternId = `${idPrefix}-motif-${resolvedMotif}`;
  const maskId = `${idPrefix}-edge-mask`;
  const gradId = `${idPrefix}-edge-gradient`;

  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        {/* Soft edge termination gradient: Ensures left & right pattern endings dissolve smoothly without harsh chop */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="3%" stopColor="#444444" />
          <stop offset="8%" stopColor="#ffffff" />
          <stop offset="92%" stopColor="#ffffff" />
          <stop offset="97%" stopColor="#444444" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        <mask id={maskId}>
          <rect width="100%" height="100%" fill={`url(#${gradId})`} />
        </mask>

        {/* Motif 2: Songket Nusantara Tradisional (Belah Ketupat & Bunga Melati Mewah) */}
        {resolvedMotif === 'songket' && (
          <pattern id={patternId} width="48" height="48" patternUnits="userSpaceOnUse" x="50%">
            {/* Outer Diamond Weave */}
            <path d="M 24 0 L 48 24 L 24 48 L 0 24 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.9" />
            {/* Secondary Inset Diamond */}
            <path d="M 24 6 L 42 24 L 24 42 L 6 24 Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            {/* Tertiary Inset Diamond */}
            <path d="M 24 12 L 36 24 L 24 36 L 12 24 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7" />
            
            {/* Center Songket Floret */}
            <polygon points="24,18 27,24 24,30 21,24" fill="currentColor" fillOpacity="0.8" />
            <polygon points="18,24 24,21 30,24 24,27" fill="currentColor" fillOpacity="0.8" />
            <circle cx="24" cy="24" r="2.5" fill="white" />
            
            {/* Corner Cross Weaves & Braces */}
            <path d="M 0 0 L 8 8 M 48 0 L 40 8 M 0 48 L 8 40 M 48 48 L 40 40" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.8" />
            <polygon points="0,0 6,0 0,6" fill="currentColor" fillOpacity="0.5" />
            <polygon points="48,0 42,0 48,6" fill="currentColor" fillOpacity="0.5" />
            <polygon points="0,48 6,48 0,42" fill="currentColor" fillOpacity="0.5" />
            <polygon points="48,48 42,48 48,42" fill="currentColor" fillOpacity="0.5" />
            
            {/* Crisp Weave Stitch Ticks */}
            <line x1="24" y1="0" x2="24" y2="6" stroke="currentColor" strokeWidth="1.6" />
            <line x1="24" y1="42" x2="24" y2="48" stroke="currentColor" strokeWidth="1.6" />
            <line x1="0" y1="24" x2="6" y2="24" stroke="currentColor" strokeWidth="1.6" />
            <line x1="42" y1="24" x2="48" y2="24" stroke="currentColor" strokeWidth="1.6" />
          </pattern>
        )}

        {/* Motif 3: Batik Kawung Royal (Batik Geometris Keraton Mewah & Anggun) */}
        {resolvedMotif === 'kawung' && (
          <pattern id={patternId} width="52" height="52" patternUnits="userSpaceOnUse" x="50%">
            {/* Outer intersecting petal curves */}
            <path 
              d="M 0 26 C 13 18, 13 8, 26 0 M 26 0 C 39 8, 39 18, 52 26 M 52 26 C 39 34, 39 44, 26 52 M 26 52 C 13 44, 13 34, 0 26" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeOpacity="0.85" 
            />
            {/* Secondary concentric arch curves */}
            <path 
              d="M 4 26 C 14 20, 14 12, 26 4 M 26 4 C 38 12, 38 20, 48 26 M 48 26 C 38 32, 38 40, 26 48 M 26 48 C 14 40, 14 32, 4 26" 
              fill="currentColor" 
              fillOpacity="0.1" 
              stroke="currentColor" 
              strokeWidth="1.4" 
              strokeOpacity="0.65" 
            />
            {/* Center concentric ring */}
            <circle cx="26" cy="26" r="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.8" />
            
            {/* Center 4-lobed royal diamond */}
            <polygon points="26,17 35,26 26,35 17,26" fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="26" cy="26" r="3.5" fill="currentColor" fillOpacity="0.95" />
            <circle cx="26" cy="26" r="1.5" fill="white" />
            
            {/* 4 Elliptical Kawung Petal Seeds (Biji Buah Kolang-Kaling) */}
            <ellipse cx="26" cy="12" rx="3.5" ry="6.5" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="26" cy="40" rx="3.5" ry="6.5" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="12" cy="26" rx="6.5" ry="3.5" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="40" cy="26" rx="6.5" ry="3.5" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="1" />
            
            {/* Corner Node Diamonds */}
            <circle cx="0" cy="0" r="4" fill="currentColor" fillOpacity="0.75" />
            <circle cx="52" cy="0" r="4" fill="currentColor" fillOpacity="0.75" />
            <circle cx="0" cy="52" r="4" fill="currentColor" fillOpacity="0.75" />
            <circle cx="52" cy="52" r="4" fill="currentColor" fillOpacity="0.75" />
          </pattern>
        )}

        {/* Motif 4: Royal Damask Istana (Pengganti Art Deco: Ornamen Kemewahan Kerajaan & Tapestri Klasik Modern) */}
        {resolvedMotif === 'damask' && (
          <pattern id={patternId} width="56" height="56" patternUnits="userSpaceOnUse" x="50%">
            {/* Primary Ogival Damask Frame */}
            <path 
              d="M 28 4 C 14 4, 6 16, 6 28 C 6 40, 14 52, 28 52 C 42 52, 50 40, 50 28 C 50 16, 42 4, 28 4 Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeOpacity="0.85" 
            />
            {/* Secondary Inner Filigree Ogee */}
            <path 
              d="M 28 9 C 18 9, 11 18, 11 28 C 11 37, 18 47, 28 47 C 38 47, 45 37, 45 28 C 45 18, 38 9, 28 9 Z" 
              fill="currentColor" 
              fillOpacity="0.08" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeOpacity="0.6" 
            />

            {/* Central Palatial Fleur-de-lis Crest (Crown) */}
            <path 
              d="M 28 12 C 26 16, 26 20, 28 23 C 30 20, 30 16, 28 12 Z" 
              fill="currentColor" 
              fillOpacity="0.8" 
              stroke="currentColor" 
              strokeWidth="1" 
            />
            <path 
              d="M 28 20 C 23 18, 19 20, 21 24 C 23 26, 26 23, 28 23" 
              fill="currentColor" 
              fillOpacity="0.7" 
              stroke="currentColor" 
              strokeWidth="1.2" 
            />
            <path 
              d="M 28 20 C 33 18, 37 20, 35 24 C 33 26, 30 23, 28 23" 
              fill="currentColor" 
              fillOpacity="0.7" 
              stroke="currentColor" 
              strokeWidth="1.2" 
            />
            <rect x="23" y="22.5" width="10" height="2" rx="1" fill="currentColor" fillOpacity="0.9" />

            {/* Center Royal Medallion Jewel */}
            <polygon points="28,24 33,28 28,32 23,28" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="28" cy="28" r="3" fill="currentColor" fillOpacity="0.95" />
            <circle cx="28" cy="28" r="1.3" fill="white" />

            {/* Lower Acanthus Palmette Flourish */}
            <path 
              d="M 28 32 C 25 36, 25 40, 28 43 C 31 40, 31 36, 28 32 Z" 
              fill="currentColor" 
              fillOpacity="0.65" 
            />
            <path 
              d="M 28 41 C 24 43, 20 40, 22 36" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.4" 
              strokeOpacity="0.75" 
            />
            <path 
              d="M 28 41 C 32 43, 36 40, 34 36" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.4" 
              strokeOpacity="0.75" 
            />

            {/* Side Acanthus Crest Leaflets */}
            <path 
              d="M 6 28 C 12 26, 16 30, 16 34" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.4" 
              strokeOpacity="0.65" 
            />
            <path 
              d="M 50 28 C 44 26, 40 30, 40 34" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.4" 
              strokeOpacity="0.65" 
            />

            {/* Corner Interlocking Damask Trellis Flourishes */}
            <path d="M 0 0 C 8 2, 12 8, 12 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" />
            <path d="M 0 0 C 2 8, 8 12, 14 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" />
            <circle cx="0" cy="0" r="3.5" fill="currentColor" fillOpacity="0.8" />
            <circle cx="0" cy="0" r="1.5" fill="white" />

            <path d="M 56 0 C 48 2, 44 8, 44 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" />
            <path d="M 56 0 C 54 8, 48 12, 42 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" />
            <circle cx="56" cy="0" r="3.5" fill="currentColor" fillOpacity="0.8" />
            <circle cx="56" cy="0" r="1.5" fill="white" />

            <path d="M 0 56 C 8 54, 12 48, 12 42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" />
            <path d="M 0 56 C 2 48, 8 44, 14 44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" />
            <circle cx="0" cy="56" r="3.5" fill="currentColor" fillOpacity="0.8" />
            <circle cx="0" cy="56" r="1.5" fill="white" />

            <path d="M 56 56 C 48 54, 44 48, 44 42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" />
            <path d="M 56 56 C 54 48, 48 44, 42 44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" />
            <circle cx="56" cy="56" r="3.5" fill="currentColor" fillOpacity="0.8" />
            <circle cx="56" cy="56" r="1.5" fill="white" />

            {/* Mid-junction nodes on edges */}
            <circle cx="28" cy="0" r="2.5" fill="currentColor" fillOpacity="0.75" />
            <circle cx="28" cy="56" r="2.5" fill="currentColor" fillOpacity="0.75" />
            <circle cx="0" cy="28" r="2.5" fill="currentColor" fillOpacity="0.75" />
            <circle cx="56" cy="28" r="2.5" fill="currentColor" fillOpacity="0.75" />
          </pattern>
        )}

        {/* Motif 5: Arabesque Star (Bintang 8 Andalusia & Geometri Maroko Mewah) */}
        {resolvedMotif === 'moroccan' && (
          <pattern id={patternId} width="52" height="52" patternUnits="userSpaceOnUse" x="50%">
            {/* Interlocking 8-Pointed Star Center (2 overlapping rotated squares) */}
            <rect 
              x="15" 
              y="15" 
              width="22" 
              height="22" 
              fill="currentColor" 
              fillOpacity="0.2" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeOpacity="0.9" 
            />
            <rect 
              x="15" 
              y="15" 
              width="22" 
              height="22" 
              fill="currentColor" 
              fillOpacity="0.2" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeOpacity="0.9" 
              transform="rotate(45 26 26)" 
            />
            
            {/* Center Jewel Rosette */}
            <circle cx="26" cy="26" r="4.5" fill="currentColor" fillOpacity="0.85" />
            <circle cx="26" cy="26" r="2" fill="white" />
            
            {/* Orthogonal Interlaced Ribbon Bands */}
            <line x1="26" y1="0" x2="26" y2="10" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.9" />
            <line x1="26" y1="42" x2="26" y2="52" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.9" />
            <line x1="0" y1="26" x2="10" y2="26" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.9" />
            <line x1="42" y1="26" x2="52" y2="26" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.9" />
            
            {/* Diagonal Corner Ribbon Bands */}
            <path d="M 0 0 L 10 10 M 52 0 L 42 10 M 0 52 L 10 42 M 52 52 L 42 42" stroke="currentColor" strokeWidth="2" strokeOpacity="0.85" />
            
            {/* Corner Star Points forming secondary continuous lattice */}
            <polygon points="0,0 8,0 0,8" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.2" />
            <polygon points="52,0 44,0 52,8" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.2" />
            <polygon points="0,52 8,52 0,44" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.2" />
            <polygon points="52,52 44,52 52,44" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.2" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
    </svg>
  );
};
