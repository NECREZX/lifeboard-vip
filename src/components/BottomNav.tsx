import React from 'react';
import { PieChart, SlidersHorizontal } from 'lucide-react';
import { DashboardNavIcon, TransaksiIcon, TabunganIcon, AktivitasIcon } from './CustomIcons';
import { UIStyle } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accentColor: string;
  onAddClick: () => void;
  uiStyle?: UIStyle;
  isDarkMode?: boolean;
}

export default function BottomNav({ activeTab, setActiveTab, accentColor, onAddClick, uiStyle, isDarkMode }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: DashboardNavIcon },
    { id: 'transaksi', label: 'Transaksi', icon: TransaksiIcon },
    { id: 'tabungan', label: 'Tabungan', icon: TabunganIcon },
    { id: 'anggaran', label: 'Anggaran', icon: PieChart },
    { id: 'aktivitas', label: 'Aktivitas', icon: AktivitasIcon },
    { id: 'kelola', label: 'Kelola', icon: SlidersHorizontal },
  ];

  const isHex = accentColor.startsWith('#');

  // Active / inactive text & icon colors depending on theme & dark mode
  const getNavTextColor = (isActive: boolean) => {
    if (isActive) {
      if (isDarkMode) return 'text-white font-black drop-shadow-sm';
      return 'text-slate-900 font-black';
    }
    if (isDarkMode) return 'text-slate-400 hover:text-slate-200';
    return 'text-slate-500 hover:text-slate-800';
  };

  const getAccentGradient = () => {
    if (isHex) return '';
    switch (accentColor) {
      case 'emerald': return 'from-emerald-400 to-emerald-600';
      case 'amber': return 'from-amber-400 to-amber-500';
      case 'rose': return 'from-rose-500 to-rose-700';
      case 'classic': return 'from-slate-700 to-slate-900';
      case 'indigo':
      default: return 'from-[#FF9999] via-[#FF7777] to-[#FF5555]';
    }
  };

  const getAccentLineColor = () => {
    if (isHex) return accentColor;
    switch (accentColor) {
      case 'emerald': return '#10b981';
      case 'amber': return '#f59e0b';
      case 'rose': return '#f43f5e';
      case 'classic': return isDarkMode ? '#f8fafc' : '#0f172a';
      case 'indigo':
      default: return '#FF7777'; // default color
    }
  };

  // Background and seamless blending styling according to uiStyle (modern, minimal, glass) & isDarkMode
  const getNavBackgroundStyle = () => {
    if (uiStyle === 'glass') {
      return isDarkMode
        ? 'bg-slate-950/80 backdrop-blur-2xl text-white'
        : 'bg-slate-50/80 backdrop-blur-2xl text-slate-800';
    }
    if (uiStyle === 'minimal') {
      return isDarkMode
        ? 'bg-slate-950 text-white'
        : 'bg-slate-50 text-slate-900';
    }
    // Modern Slate (default)
    if (isDarkMode) {
      return 'bg-slate-950 text-white';
    }
    return 'bg-slate-50 text-slate-900';
  };

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-40 w-full no-print select-none transition-colors duration-300 border-none shadow-none ${getNavBackgroundStyle()}`}
      id="bottom-dock-nav"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)'
      }}
    >
      <div className="max-w-2xl mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-7 items-center justify-items-center relative w-full h-14 sm:h-16">
          {/* Left Tabs (1 to 3) */}
          {tabs.slice(0, 3).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                title={tab.label}
                className={`group w-full h-full flex flex-col items-center justify-center rounded-xl transition-all duration-200 focus:outline-none touch-manipulation relative ${getNavTextColor(isActive)}`}
                style={isActive && isHex ? { color: accentColor } : (isActive && accentColor === 'indigo' ? { color: '#FF7777' } : undefined)}
                id={`nav-tab-${tab.id}`}
              >
                <Icon className={`transition-all duration-200 shrink-0 ${isActive ? 'w-6 h-6 stroke-[2.4] scale-110' : 'w-5 h-5 stroke-[1.8] opacity-75 group-hover:opacity-100 group-hover:scale-105'}`} />

                {isActive && (
                  <span 
                    className="absolute bottom-1 w-4 h-1 rounded-full animate-in fade-in duration-300 shadow-xs" 
                    style={{ backgroundColor: getAccentLineColor() }}
                  />
                )}
              </button>
            );
          })}

          {/* Center Elevated Action Button (Like DANA / FinTech style) */}
          <div className="w-full flex justify-center items-center -mt-6 z-10">
            <button
              onClick={onAddClick}
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full text-white bg-gradient-to-tr ${getAccentGradient()} flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none ring-4 ${isDarkMode ? 'ring-slate-950' : 'ring-slate-50'} shadow-md shrink-0 cursor-pointer`}
              style={isHex ? { backgroundColor: accentColor, backgroundImage: 'none' } : undefined}
              title="Catat Baru (Pemasukan, Pengeluaran, Anggaran, Tabungan, dll)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
          </div>

          {/* Right Tabs (4 to 6) */}
          {tabs.slice(3, 6).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                title={tab.label}
                className={`group w-full h-full flex flex-col items-center justify-center rounded-xl transition-all duration-200 focus:outline-none touch-manipulation relative ${getNavTextColor(isActive)}`}
                style={isActive && isHex ? { color: accentColor } : (isActive && accentColor === 'indigo' ? { color: '#FF7777' } : undefined)}
                id={`nav-tab-${tab.id}`}
              >
                <Icon className={`transition-all duration-200 shrink-0 ${isActive ? 'w-6 h-6 stroke-[2.4] scale-110' : 'w-5 h-5 stroke-[1.8] opacity-75 group-hover:opacity-100 group-hover:scale-105'}`} />

                {isActive && (
                  <span 
                    className="absolute bottom-1 w-4 h-1 rounded-full animate-in fade-in duration-300 shadow-xs" 
                    style={{ backgroundColor: getAccentLineColor() }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

