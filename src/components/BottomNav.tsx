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
    if (isHex) return `0 4px 16px ${accentColor}40`;
    switch (accentColor) {
      case 'emerald': return '0 4px 16px rgba(16, 185, 129, 0.35)';
      case 'amber': return '0 4px 16px rgba(245, 158, 11, 0.35)';
      case 'rose': return '0 4px 16px rgba(244, 63, 94, 0.35)';
      case 'classic': return '0 4px 16px rgba(15, 23, 42, 0.25)';
      case 'indigo':
      default: return '0 4px 16px rgba(255, 94, 94, 0.35)';
    }
  };

  const resolvedAccent = getAccentColor();

  const svgFillClass = isDarkMode ? 'fill-slate-950' : 'fill-white';
  const wingBgClass = isDarkMode ? 'bg-slate-950' : 'bg-white';
  
  // Clean border matching across all elements
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
        className="group relative flex flex-col items-center justify-center focus:outline-none select-none touch-manipulation cursor-pointer shrink-0"
        id={`nav-tab-${tab.id}`}
      >
        {/* Compact Unified Capsule: Precision aligned with identical height & width */}
        <div 
          className={`flex flex-col items-center justify-center w-[46px] xs:w-[50px] py-1.5 rounded-2xl transition-all duration-150 ${
            isActive 
              ? 'shadow-xs font-bold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
          }`}
          style={isActive ? { 
            backgroundColor: `${resolvedAccent}18`,
            color: resolvedAccent,
          } : undefined}
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.9]'}`} />
          </div>

          {/* Navigation Label: Precision aligned text baseline */}
          <span 
            className={`text-[9.5px] xs:text-[10px] tracking-tight leading-none whitespace-nowrap text-center mt-1 transition-colors ${
              isActive 
                ? 'font-extrabold' 
                : 'font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
            }`}
            style={isActive ? { color: resolvedAccent } : undefined}
          >
            {tab.label}
          </span>
        </div>
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
      {/* BACKGROUND DOCK CONTAINER:
          Left wing (pure horizontal border-t) + Right wing (pure horizontal border-t)
          + Seamless Round Center Notch SVG (ultra smooth continuous curve matching reference exactly)
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Left Wing Box: 100% straight border-t from left edge to notch with 2px overlap to eliminate subpixel gap */}
        <div 
          className={`absolute left-0 top-0 bottom-0 ${wingBgClass} border-t border-slate-200 dark:border-slate-800`}
          style={{ right: 'calc(50% + 54px)' }}
        />

        {/* Center Cradle Notch SVG: 112px wide with generous breathing space around circular button */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[112px] h-[140px]">
          <svg className="w-full h-full block" viewBox="0 0 112 140" fill="none">
            {/* Background Fill */}
            <path 
              d="M 0,0 L 6,0 C 14,0 20,2 24,7 C 28,13 36,44 56,44 C 76,44 84,13 88,7 C 92,2 98,0 106,0 L 112,0 L 112,140 L 0,140 Z" 
              className={svgFillClass}
            />
            {/* Top Border Line: 100% continuous and seamless with wing border-t */}
            <path 
              d="M 0,0.5 L 6,0.5 C 14,0.5 20,2.5 24,7.5 C 28,13.5 36,44.5 56,44.5 C 76,44.5 84,13.5 88,7.5 C 92,2.5 98,0.5 106,0.5 L 112,0.5" 
              fill="none" 
              stroke={outlineStroke}
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Right Wing Box: 100% straight border-t from notch to right edge with 2px overlap to eliminate subpixel gap */}
        <div 
          className={`absolute right-0 top-0 bottom-0 ${wingBgClass} border-t border-slate-200 dark:border-slate-800`}
          style={{ left: 'calc(50% + 54px)' }}
        />

        {/* Solid Base Fill below safe area */}
        <div className={`absolute left-0 right-0 top-[68px] -bottom-20 ${wingBgClass}`} />
      </div>

      {/* COMPACT & PRECISE CARD CONTENT CONTAINER (H-70PX) & FLOATING CENTER FAB */}
      <div className="relative z-10 w-full max-w-lg mx-auto h-[70px]">
        
        {/* Left Wing Tabs: Compact, clustered tightly towards center, perfectly leveled */}
        <div 
          className="absolute top-0 bottom-0 flex items-center justify-end gap-1 xs:gap-2 pb-1"
          style={{ 
            right: 'calc(50% + 40px)',
          }}
        >
          {tabs.slice(0, 3).map((tab) => renderNavTab(tab))}
        </div>

        {/* Center Floating FAB Button: 48px circle nested precisely with balanced margins */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 flex items-center justify-center z-30">
          <button
            type="button"
            onClick={onAddClick}
            className={`group relative w-[48px] h-[48px] xs:w-[50px] xs:h-[50px] rounded-full flex items-center justify-center focus:outline-none cursor-pointer bg-gradient-to-tr ${getFabGradient()} transition-transform active:scale-95`}
            style={{
              boxShadow: getFabShadowColor(),
              ...(isHex ? { backgroundColor: accentColor, backgroundImage: 'none' } : {})
            }}
            title="Catat Baru"
            id="center-fab-add"
          >
            <Plus className="w-5.5 h-5.5 xs:w-6 xs:h-6 text-white stroke-[2.8]" />
          </button>
        </div>

        {/* Right Wing Tabs: Compact, clustered tightly towards center, perfectly leveled */}
        <div 
          className="absolute top-0 bottom-0 flex items-center justify-start gap-1 xs:gap-2 pb-1"
          style={{ 
            left: 'calc(50% + 40px)',
          }}
        >
          {tabs.slice(3, 6).map((tab) => renderNavTab(tab))}
        </div>

      </div>
    </nav>
  );
}
