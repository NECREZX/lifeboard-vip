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
  
  // Clean, subtle hairline border matching across all SVG elements
  const outlineStroke = isDarkMode ? '#334155' : '#e2e8f0';

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
        className="w-10 xs:w-11 sm:w-12 h-full flex flex-col items-center justify-center py-1 focus:outline-none select-none touch-manipulation cursor-pointer shrink-0"
        id={`nav-tab-${tab.id}`}
      >
        {/* Uniform Icon Container */}
        <div 
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isActive 
              ? 'shadow-2xs' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          style={isActive ? { 
            backgroundColor: `${resolvedAccent}18`,
            color: resolvedAccent,
          } : undefined}
        >
          <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
        </div>

        {/* Navigation Label: ONLY for active tab */}
        <div className="h-3 flex items-center justify-center mt-0.5 pointer-events-none">
          {isActive ? (
            <span 
              className="text-[8.5px] xs:text-[9px] font-extrabold tracking-tight leading-none whitespace-nowrap max-w-[48px] truncate"
              style={{ color: resolvedAccent }}
            >
              {tab.label}
            </span>
          ) : (
            <span className="block w-1 h-1 rounded-full bg-transparent" />
          )}
        </div>
      </button>
    );
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 w-full no-print select-none shadow-[0_-3px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-3px_25px_rgba(0,0,0,0.4)]"
      id="bottom-dock-nav"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* 1. ALL-SVG UNIFIED BACKGROUND DOCK:
          Left Wing SVG + Center Notch SVG + Right Wing SVG overlapping seamlessly by 4px.
          Eliminates any subpixel flex seam gap on mobile Chrome.
      */}
      <div className="absolute left-0 right-0 top-0 -bottom-10 pointer-events-none overflow-hidden">
        
        {/* Left Wing SVG: Pure horizontal line at y=0.5 overlapping 4px into center scoop */}
        <div className="absolute left-0 top-0 bottom-0" style={{ right: 'calc(50% + 46px)' }}>
          <svg className="w-full h-[120px] block" preserveAspectRatio="none" viewBox="0 0 100 120">
            <path d="M 0,0 L 100,0 L 100,120 L 0,120 Z" className={svgFillClass} />
            <line x1="0" y1="0.5" x2="100" y2="0.5" stroke={outlineStroke} strokeWidth="1" />
          </svg>
        </div>

        {/* Center Cradle Notch SVG: 100px wide classic organic S-curve */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[100px] h-[120px] z-10">
          <svg className="w-full h-full block" viewBox="0 0 100 120" fill="none">
            {/* Background Fill */}
            <path 
              d="M 0,0 C 10,0 16,2 20,8 C 25,24 35,42 50,42 C 65,42 75,24 80,8 C 84,2 90,0 100,0 L 100,120 L 0,120 Z" 
              className={svgFillClass}
            />
            {/* Continuous 1px Outline Stroke */}
            <path 
              d="M 0,0.5 C 10,0.5 16,2.5 20,8.5 C 25,24 35,42.5 50,42.5 C 65,42.5 75,24 80,8.5 C 84,2.5 90,0.5 100,0.5" 
              fill="none" 
              stroke={outlineStroke}
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Right Wing SVG: Pure horizontal line at y=0.5 overlapping 4px into center scoop */}
        <div className="absolute right-0 top-0 bottom-0" style={{ left: 'calc(50% + 46px)' }}>
          <svg className="w-full h-[120px] block" preserveAspectRatio="none" viewBox="0 0 100 120">
            <path d="M 0,0 L 100,0 L 100,120 L 0,120 Z" className={svgFillClass} />
            <line x1="0" y1="0.5" x2="100" y2="0.5" stroke={outlineStroke} strokeWidth="1" />
          </svg>
        </div>

        {/* Deep Solid Base Fill extending below safe area */}
        <div className={`absolute left-0 right-0 top-[60px] -bottom-20 ${wingBgClass}`} />
      </div>

      {/* 2. RAISED TALLER BOTTOM BAR CONTENT (H-74PX) & FLOATING CENTER FAB */}
      <div className="relative z-10 w-full max-w-md mx-auto h-[74px]">
        
        {/* Left Wing Tabs: Compact, aligned & closer to center */}
        <div 
          className="absolute top-0 bottom-0 flex items-center justify-end gap-1.5 xs:gap-2.5 sm:gap-3.5 pb-1"
          style={{ 
            right: 'calc(50% + 50px)',
            left: '8px'
          }}
        >
          {tabs.slice(0, 3).map((tab) => renderNavTab(tab))}
        </div>

        {/* Center Floating FAB Button: 48px circle */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 flex items-center justify-center z-30">
          <button
            type="button"
            onClick={onAddClick}
            className={`group relative w-[48px] h-[48px] rounded-full flex items-center justify-center focus:outline-none cursor-pointer bg-gradient-to-tr ${getFabGradient()}`}
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

        {/* Right Wing Tabs: Compact, aligned & closer to center */}
        <div 
          className="absolute top-0 bottom-0 flex items-center justify-start gap-1.5 xs:gap-2.5 sm:gap-3.5 pb-1"
          style={{ 
            left: 'calc(50% + 50px)',
            right: '8px'
          }}
        >
          {tabs.slice(3, 6).map((tab) => renderNavTab(tab))}
        </div>

      </div>
    </nav>
  );
}
