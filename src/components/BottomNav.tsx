import React from 'react';
import { PieChart, SlidersHorizontal } from 'lucide-react';
import { DashboardNavIcon, TransaksiIcon, TabunganIcon, AktivitasIcon } from './CustomIcons';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accentColor: string;
  onAddClick: () => void;
  uiStyle?: string;
}

export default function BottomNav({ activeTab, setActiveTab, accentColor, onAddClick, uiStyle }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: DashboardNavIcon },
    { id: 'transaksi', label: 'Transaksi', icon: TransaksiIcon },
    { id: 'tabungan', label: 'Tabungan', icon: TabunganIcon },
    { id: 'anggaran', label: 'Anggaran', icon: PieChart },
    { id: 'aktivitas', label: 'Aktivitas', icon: AktivitasIcon },
    { id: 'kelola', label: 'Kelola', icon: SlidersHorizontal },
  ];

  const isHex = accentColor.startsWith('#');

  // Map theme colors to CSS active highlight colors - pure white for high contrast
  const getActiveStyles = (isActive: boolean) => {
    if (!isActive) return 'text-white/70 hover:text-white';
    return 'text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]';
  };

  const getAccentGradient = () => {
    if (isHex) return '';
    switch (accentColor) {
      case 'emerald': return 'from-emerald-400 to-emerald-600';
      case 'amber': return 'from-amber-400 to-amber-500';
      case 'rose': return 'from-rose-400 to-rose-600';
      case 'classic': return 'from-slate-700 to-slate-900';
      case 'indigo':
      default: return 'from-rose-600 via-rose-800 to-rose-600';
    }
  };

  const getAccentLine = () => {
    return 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]';
  };

  return (
    <div 
      className="fixed left-0 right-0 z-40 px-3 sm:px-4 max-w-2xl mx-auto pointer-events-none no-print"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      <div 
        className="pointer-events-auto rounded-2xl p-1.5 grid grid-cols-7 items-center justify-items-center relative w-full transition-all duration-300 text-white backdrop-blur-2xl border border-white/40 ring-1 ring-white/20 shadow-[0_16px_45px_rgba(136,19,55,0.4)]"
        id="bottom-dock-container"
      >
        {/* Background gradient and Songket motif pattern confined inside rounded container */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none bg-gradient-to-r from-rose-800 via-rose-950 to-rose-800 -z-10">
          {/* Authentic Songket Weave Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="bottomnav-songket-motif" width="36" height="36" patternUnits="userSpaceOnUse">
                  {/* Outer Diamond Weave */}
                  <path d="M 18 0 L 36 18 L 18 36 L 0 18 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  {/* Secondary Inset Diamond */}
                  <path d="M 18 5 L 31 18 L 18 31 L 5 18 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
                  {/* Tertiary Inset Diamond */}
                  <path d="M 18 10 L 26 18 L 18 26 L 10 18 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
                  
                  {/* Center Songket Floret (Pucuk Rebung / Bunga Intan) */}
                  <polygon points="18,13 21,18 18,23 15,18" fill="currentColor" fillOpacity="0.45" />
                  <polygon points="13,18 18,15 23,18 18,21" fill="currentColor" fillOpacity="0.45" />
                  <rect x="17" y="17" width="2" height="2" fill="white" />
                  
                  {/* Corner Songket Cross Weaves connecting the grid */}
                  <path d="M 0 0 L 5 5 M 36 0 L 31 5 M 0 36 L 5 31 M 36 36 L 31 31" stroke="currentColor" strokeWidth="0.6" />
                  <polygon points="0,0 3,0 0,3" fill="currentColor" fillOpacity="0.3" />
                  <polygon points="36,0 33,0 36,3" fill="currentColor" fillOpacity="0.3" />
                  <polygon points="0,36 3,36 0,33" fill="currentColor" fillOpacity="0.3" />
                  <polygon points="36,36 33,36 36,33" fill="currentColor" fillOpacity="0.3" />
                  
                  {/* Fine Songket Ticks */}
                  <line x1="18" y1="0" x2="18" y2="5" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1,1" />
                  <line x1="18" y1="31" x2="18" y2="36" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1,1" />
                  <line x1="0" y1="18" x2="5" y2="18" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1,1" />
                  <line x1="31" y1="18" x2="36" y2="18" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1,1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#bottomnav-songket-motif)" />
            </svg>
          </div>
          
          {/* Subtle warm rose atmospheric glow */}
          <div className="absolute -left-4 -bottom-4 w-28 h-16 bg-rose-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -right-4 -top-4 w-28 h-16 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />
        </div>
        {tabs.slice(0, 3).map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group w-full flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 select-none focus:outline-none touch-manipulation relative ${getActiveStyles(isActive)}`}
              style={isActive && isHex ? { color: accentColor } : undefined}
              id={`nav-tab-${tab.id}`}
            >
              <Icon className={`transition-all duration-200 shrink-0 ${isActive ? 'w-5 h-5 stroke-[2.5] scale-105' : 'w-5 h-5 stroke-[2] group-hover:scale-110'}`} />
              
              <span 
                className={`text-[9px] sm:text-[10px] font-bold tracking-tight transition-all duration-200 text-center leading-tight truncate max-w-full ${
                  isActive 
                    ? 'opacity-100 max-h-4 mt-0.5 block' 
                    : 'opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-4 group-hover:mt-0.5 overflow-hidden'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span 
                  className={`absolute bottom-0 w-4 h-0.5 rounded-full ${getAccentLine()} animate-in fade-in duration-300`} 
                  style={isHex ? { backgroundColor: accentColor } : undefined}
                />
              )}
            </button>
          );
        })}

        {/* Center Add Button */}
        <div className="w-full flex justify-center items-center -mt-6 sm:-mt-7 z-10">
          <button
            onClick={onAddClick}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white bg-gradient-to-tr ${getAccentGradient()} shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none border-3 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.25)] shrink-0`}
            style={isHex ? { backgroundColor: accentColor, backgroundImage: 'none', boxShadow: `0 8px 25px ${accentColor}66` } : undefined}
            title="Catat Baru (Pemasukan, Pengeluaran, Anggaran, Tabungan, dll)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>

        {tabs.slice(3, 6).map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group w-full flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 select-none focus:outline-none touch-manipulation relative ${getActiveStyles(isActive)}`}
              style={isActive && isHex ? { color: accentColor } : undefined}
              id={`nav-tab-${tab.id}`}
            >
              <Icon className={`transition-all duration-200 shrink-0 ${isActive ? 'w-5 h-5 stroke-[2.5] scale-105' : 'w-5 h-5 stroke-[2] group-hover:scale-110'}`} />
              
              <span 
                className={`text-[9px] sm:text-[10px] font-bold tracking-tight transition-all duration-200 text-center leading-tight truncate max-w-full ${
                  isActive 
                    ? 'opacity-100 max-h-4 mt-0.5 block' 
                    : 'opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-4 group-hover:mt-0.5 overflow-hidden'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span 
                  className={`absolute bottom-0 w-4 h-0.5 rounded-full ${getAccentLine()} animate-in fade-in duration-300`} 
                  style={isHex ? { backgroundColor: accentColor } : undefined}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

