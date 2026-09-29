import React from 'react';
import { Plus, PieChart, SlidersHorizontal, Calendar } from 'lucide-react';
import { DashboardNavIcon, TransaksiIcon, TabunganIcon } from './CustomIcons';
import { UIStyle, Language } from '../types';
import { t } from '../lib/i18n';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accentColor: string;
  onAddClick: () => void;
  uiStyle?: UIStyle;
  isDarkMode?: boolean;
  language?: Language;
}

export default function BottomNav({ 
  activeTab, 
  setActiveTab, 
  accentColor, 
  onAddClick, 
  uiStyle, 
  isDarkMode, 
  language = 'id' 
}: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: t('nav_dashboard', language), icon: DashboardNavIcon },
    { id: 'transaksi', label: t('nav_transactions', language), icon: TransaksiIcon },
    { id: 'tabungan', label: t('nav_savings', language), icon: TabunganIcon },
    { id: 'anggaran', label: t('nav_budgeting', language), icon: PieChart },
    { id: 'aktivitas', label: t('nav_activities', language), icon: Calendar },
    { id: 'kelola', label: t('nav_manage', language), icon: SlidersHorizontal },
  ];

  const isHex = accentColor.startsWith('#');

  const getAccentColor = () => {
    if (isHex) return accentColor;
    switch (accentColor) {
      case 'emerald': return '#10b981';
      case 'amber': return '#f59e0b';
      case 'rose': return '#f43f5e';
      case 'classic': return isDarkMode ? '#f8fafc' : '#0f172a';
      case 'indigo':
      default: return '#FF5E5E';
    }
  };

  const getFabGradient = () => {
    if (isHex) return '';
    switch (accentColor) {
      case 'emerald': return 'from-emerald-500 via-emerald-600 to-teal-700';
      case 'amber': return 'from-amber-400 via-amber-500 to-orange-600';
      case 'rose': return 'from-rose-500 via-rose-600 to-pink-600';
      case 'classic': return 'from-slate-700 via-slate-800 to-slate-950';
      case 'indigo':
      default: return 'from-[#FF7B7B] via-[#FF5E5E] to-[#FF4747]';
    }
  };

  const getFabShadowColor = () => {
    if (isHex) return `0 6px 18px ${accentColor}45`;
    switch (accentColor) {
      case 'emerald': return '0 6px 18px rgba(16, 185, 129, 0.4)';
      case 'amber': return '0 6px 18px rgba(245, 158, 11, 0.4)';
      case 'rose': return '0 6px 18px rgba(244, 63, 94, 0.4)';
      case 'classic': return '0 6px 18px rgba(15, 23, 42, 0.3)';
      case 'indigo':
      default: return '0 6px 18px rgba(255, 94, 94, 0.4)';
    }
  };

  const resolvedAccent = getAccentColor();

  const wingBgClass = uiStyle === 'glass'
    ? (isDarkMode ? 'bg-slate-950/95 backdrop-blur-2xl' : 'bg-white/95 backdrop-blur-2xl')
    : (isDarkMode ? 'bg-slate-950' : 'bg-white');

  const svgFillClass = isDarkMode ? 'fill-slate-950' : 'fill-white';
  
  // Clean, subtle 1px hairline border matching the screenshot
  const outlineStroke = isDarkMode ? '#334155' : '#e2e8f0';

  const isLeftWingActive = tabs.slice(0, 3).some(t => t.id === activeTab);
  const isRightWingActive = tabs.slice(3, 6).some(t => t.id === activeTab);

  const renderNavTab = (tab: typeof tabs[0], isRightWing = false) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;

    if (isActive) {
      // ACTIVE TAB: Padat & compact
      // Sayap Kiri: [Icon] [Nama] (mengembang ke kanan)
      // Sayap Kanan: [Nama] [Icon] (mengembang ke kiri)
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          aria-label={tab.label}
          title={tab.label}
          className={`h-7 px-2 rounded-full flex items-center justify-center gap-1 shrink-0 focus:outline-none select-none touch-manipulation cursor-pointer active:scale-95 transition-all duration-200 shadow-xs ${
            isRightWing ? 'flex-row-reverse' : 'flex-row'
          }`}
          style={{ 
            backgroundColor: `${resolvedAccent}18`,
            color: resolvedAccent,
            border: `1px solid ${resolvedAccent}30`
          }}
          id={`nav-tab-${tab.id}`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
          <span className="text-[9px] font-bold tracking-tight whitespace-nowrap leading-none max-w-[42px] truncate">
            {tab.label}
          </span>
        </button>
      );
    }

    // INACTIVE TAB: Compact icon circle, seragam dan sama besar
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => setActiveTab(tab.id)}
        aria-label={tab.label}
        title={tab.label}
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200 focus:outline-none select-none touch-manipulation cursor-pointer active:scale-90"
        id={`nav-tab-${tab.id}`}
      >
        <Icon className="w-4 h-4 stroke-[1.8]" />
      </button>
    );
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 w-full no-print select-none shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.45)]"
      id="bottom-dock-nav"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* 1. SEAMLESS EXTENDED SOLID BACKGROUND WITH SMOOTH GENTLE CRADLE NOTCH */}
      <div className="absolute left-0 right-0 top-0 -bottom-10 pointer-events-none overflow-hidden">
        {/* Left Wing with subtle top border */}
        <div 
          className={`absolute left-0 top-0 bottom-0 ${wingBgClass}`} 
          style={{ 
            right: 'calc(50% + 49.5px)',
            borderTop: `1px solid ${outlineStroke}`
          }}
        />

        {/* Center 100px Cradle Scoop: Gentle, concentric rounded arc matching reference photo */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[100px] h-[64px]">
          <svg 
            viewBox="0 0 100 64" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full block"
          >
            {/* Background Fill */}
            <path 
              d="M 0,0 C 10,0 16,2 20,8 C 25,24 35,44 50,44 C 65,44 75,24 80,8 C 84,2 90,0 100,0 L 100,64 L 0,64 Z" 
              className={svgFillClass}
            />
            {/* Continuous 1px Outline connecting seamlessly to left & right wings */}
            <path 
              d="M 0,0.5 C 10,0.5 16,2.5 20,8.5 C 25,24 35,44 50,44 C 65,44 75,24 80,8.5 C 84,2.5 90,0.5 100,0.5" 
              fill="none" 
              stroke={outlineStroke}
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Right Wing with subtle top border */}
        <div 
          className={`absolute top-0 bottom-0 right-0 ${wingBgClass}`} 
          style={{ 
            left: 'calc(50% + 49.5px)',
            borderTop: `1px solid ${outlineStroke}`
          }}
        />

        {/* Deep Solid Base Strip: covers from Y=44px to -bottom-10 across 100% width */}
        <div className={`absolute left-0 right-0 top-[44px] bottom-0 ${wingBgClass}`} />
      </div>

      {/* 2. BALANCED NAVIGATION CONTENT & FLOATING CENTER FAB */}
      <div className="relative z-10 w-full h-[62px]">
        
        {/* Left Wing Tabs:
            - Saat TIDAK ADA tab aktif di kiri: normal seimbang di tengah (justify-evenly)
            - Saat ADA tab aktif di kiri: justify-start (Dashboard melebar, Transaksi & Tabungan geser ke kanan)
        */}
        <div 
          className={`absolute left-2 xs:left-3 sm:left-6 top-0 bottom-0 flex items-center transition-all duration-300 ${
            isLeftWingActive 
              ? 'justify-start gap-1 xs:gap-1.5 sm:gap-2.5' 
              : 'justify-evenly'
          }`}
          style={{ right: 'calc(50% + 56px)' }}
        >
          {tabs.slice(0, 3).map((tab) => renderNavTab(tab, false))}
        </div>

        {/* Center Floating FAB Button: 48px circle, floating with soft shadow matching reference */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 flex items-center justify-center z-30">
          <button
            type="button"
            onClick={onAddClick}
            className={`group relative w-[48px] h-[48px] rounded-full flex items-center justify-center focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-tr ${getFabGradient()}`}
            style={{
              boxShadow: getFabShadowColor(),
              ...(isHex ? { backgroundColor: accentColor, backgroundImage: 'none' } : {})
            }}
            title="Catat Baru"
            id="center-fab-add"
          >
            <Plus className="w-5.5 h-5.5 text-white stroke-[2.8]" />
          </button>
        </div>

        {/* Right Wing Tabs:
            - Saat TIDAK ADA tab aktif di kanan: normal seimbang di tengah (justify-evenly)
            - Saat ADA tab aktif di kanan: justify-end (Budgeting melebar ke kiri)
        */}
        <div 
          className={`absolute top-0 bottom-0 right-2 xs:right-3 sm:right-6 flex items-center transition-all duration-300 ${
            isRightWingActive 
              ? 'justify-end gap-1 xs:gap-1.5 sm:gap-2.5' 
              : 'justify-evenly'
          }`}
          style={{ left: 'calc(50% + 56px)' }}
        >
          {tabs.slice(3, 6).map((tab) => renderNavTab(tab, true))}
        </div>

      </div>
    </nav>
  );
}
