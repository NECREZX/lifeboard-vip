import React from 'react';
import { Plus, PieChart, SlidersHorizontal } from 'lucide-react';
import { DashboardNavIcon, TransaksiIcon, TabunganIcon, AktivitasIcon } from './CustomIcons';
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
    { id: 'aktivitas', label: t('nav_activities', language), icon: AktivitasIcon },
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
    if (isHex) return `0 4px 16px ${accentColor}60`;
    switch (accentColor) {
      case 'emerald': return '0 4px 16px rgba(16, 185, 129, 0.45)';
      case 'amber': return '0 4px 16px rgba(245, 158, 11, 0.45)';
      case 'rose': return '0 4px 16px rgba(244, 63, 94, 0.45)';
      case 'classic': return '0 4px 16px rgba(15, 23, 42, 0.4)';
      case 'indigo':
      default: return '0 4px 16px rgba(255, 94, 94, 0.45)';
    }
  };

  const resolvedAccent = getAccentColor();

  const wingBgClass = uiStyle === 'glass'
    ? (isDarkMode ? 'bg-slate-950/95 backdrop-blur-2xl' : 'bg-white/95 backdrop-blur-2xl')
    : (isDarkMode ? 'bg-slate-950' : 'bg-white');

  const svgFillClass = isDarkMode ? 'fill-slate-950' : 'fill-white';
  
  // Adaptive outline: subtle 1px border matching Tailwind slate-200 in light, slate-800 in dark
  const topBorderClass = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const outlineStroke = isDarkMode ? '#1e293b' : '#e2e8f0';

  const renderNavTab = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => setActiveTab(tab.id)}
        aria-label={tab.label}
        title={tab.label}
        className="group relative w-full h-full flex flex-col items-center justify-center focus:outline-none select-none touch-manipulation cursor-pointer py-1 px-0.5 transition-transform active:scale-95"
        id={`nav-tab-${tab.id}`}
      >
        <div 
          className={`flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200 ${
            isActive ? 'scale-105' : 'group-hover:scale-110'
          }`}
          style={isActive ? { 
            backgroundColor: `${resolvedAccent}18`,
            color: resolvedAccent 
          } : undefined}
        >
          <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform ${
            isActive 
              ? 'stroke-[2.2]' 
              : 'stroke-[1.7] text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
          }`} />
        </div>
        
        {/* Name Label: Hidden when inactive, shown when active OR hovered (diarahin) */}
        <span 
          className={`text-[9.5px] tracking-tight text-center truncate max-w-[56px] leading-tight transition-all duration-200 overflow-hidden ${
            isActive 
              ? 'opacity-100 max-h-4 mt-1 font-bold translate-y-0' 
              : 'opacity-0 max-h-0 mt-0 font-medium text-slate-500 dark:text-slate-400 translate-y-1 group-hover:opacity-100 group-hover:max-h-4 group-hover:mt-1 group-hover:translate-y-0 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          }`}
          style={isActive ? { color: resolvedAccent } : undefined}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 w-full no-print select-none shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)]"
      id="bottom-dock-nav"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* 1. SEAMLESS EXTENDED SOLID BACKGROUND WITH CONTINUOUS UNIFIED OUTLINE */}
      <div className="absolute left-0 right-0 top-0 -bottom-10 pointer-events-none overflow-hidden">
        {/* Left Wing with subtle top border */}
        <div 
          className={`absolute left-0 top-0 bottom-0 ${wingBgClass} border-t ${topBorderClass}`} 
          style={{ right: 'calc(50% + 54px)' }}
        />

        {/* Center 116px Cradle Scoop: Broad, non-pointy U-bottom, seamless continuous outline */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[124px] h-[80px]">
          <svg 
            viewBox="-4 0 124 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full block"
          >
            {/* Background Fill */}
            <path 
              d="M -4,0 L 0,0 C 8,0 14,2 18,8 C 24,18 36,52 58,52 C 80,52 92,18 98,8 C 102,2 108,0 116,0 L 120,0 L 120,80 L -4,80 Z" 
              className={svgFillClass}
            />
            {/* Seamless Continuous Outline: 1px hairline connecting seamlessly to left & right wings */}
            <path 
              d="M -4,0.5 L 0,0.5 C 8,0.5 14,2.5 18,8.5 C 24,18.5 36,52.5 58,52.5 C 80,52.5 92,18.5 98,8.5 C 102,2.5 108,0.5 116,0.5 L 120,0.5" 
              fill="none" 
              stroke={outlineStroke}
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Right Wing with subtle top border */}
        <div 
          className={`absolute top-0 bottom-0 right-0 ${wingBgClass} border-t ${topBorderClass}`} 
          style={{ left: 'calc(50% + 54px)' }}
        />

        {/* Deep Solid Base Strip: covers from Y=60px to -bottom-10 across 100% width */}
        <div className={`absolute left-0 right-0 top-[60px] bottom-0 ${wingBgClass}`} />
      </div>

      {/* 2. BALANCED NAVIGATION CONTENT & CENTER FAB */}
      <div className="relative z-10 w-full h-[68px] px-2 sm:px-4">
        
        {/* Left Wing Tabs: 3 Equal Columns (Dashboard, Transaksi, Tabungan) */}
        <div 
          className="absolute left-2 top-0 bottom-0 grid grid-cols-3 items-center justify-items-center"
          style={{ right: 'calc(50% + 58px)' }}
        >
          {tabs.slice(0, 3).map(renderNavTab)}
        </div>

        {/* Center FAB Button: 46px circle, top aligned at Y=0, spacious inside 116px rounded cradle */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center z-20">
          <button
            type="button"
            onClick={onAddClick}
            className={`group relative w-[46px] h-[46px] rounded-full flex items-center justify-center focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-tr ${getFabGradient()}`}
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

        {/* Right Wing Tabs: 3 Equal Columns (Budgeting, Aktivitas, Pengaturan) */}
        <div 
          className="absolute top-0 bottom-0 right-2 grid grid-cols-3 items-center justify-items-center"
          style={{ left: 'calc(50% + 58px)' }}
        >
          {tabs.slice(3, 6).map(renderNavTab)}
        </div>

      </div>
    </nav>
  );
}
