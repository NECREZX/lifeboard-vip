import React from 'react';
import { Plus, PieChart, SlidersHorizontal, Calendar } from 'lucide-react';
import { DashboardNavIcon, TransaksiIcon, TabunganIcon } from './CustomIcons';
import { UIStyle, Language, CardRadius } from '../types';
import { t } from '../lib/i18n';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accentColor: string;
  onAddClick: () => void;
  uiStyle?: UIStyle;
  cardRadius?: CardRadius;
  cardStyle?: 'flat' | 'bordered' | 'shadowed';
  isDarkMode?: boolean;
  language?: Language;
}

export default function BottomNav({ 
  activeTab, 
  setActiveTab, 
  accentColor, 
  onAddClick, 
  uiStyle, 
  cardRadius = 'rounded',
  cardStyle = 'shadowed',
  isDarkMode, 
  language = 'id' 
}: BottomNavProps) {
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
      case 'emerald': return 'from-emerald-500 to-teal-600';
      case 'amber': return 'from-amber-400 to-orange-500';
      case 'rose': return 'from-rose-500 to-pink-600';
      case 'classic': return 'from-slate-700 to-slate-900';
      case 'indigo':
      default: return 'from-[#FF7777] to-[#FF4E4E]';
    }
  };

  const resolvedAccent = getAccentColor();

  const isSharp = cardRadius === 'sharp';
  const isExtra = cardRadius === 'extra';
  const isBordered = cardStyle === 'bordered';

  // Warna abu-abu persis seperti garis tepi di card aplikasi (border-slate-200 / dark:border-slate-800)
  const borderClasses = isBordered
    ? 'border-slate-300 dark:border-slate-700'
    : 'border-slate-200 dark:border-slate-800';

  const borderWidthTop = isBordered ? 'border-t-2' : 'border-t';

  const getNavRadiusStyle = (): React.CSSProperties => {
    if (isSharp) {
      return { 
        borderTopLeftRadius: '0px', 
        borderTopRightRadius: '0px',
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px'
      };
    }
    if (isExtra) {
      return { 
        borderTopLeftRadius: '36px', 
        borderTopRightRadius: '36px',
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px'
      };
    }
    // Default rounded (bulat) - 100% simetris kiri & kanan atas
    return { 
      borderTopLeftRadius: '24px', 
      borderTopRightRadius: '24px',
      borderBottomLeftRadius: '0px',
      borderBottomRightRadius: '0px'
    };
  };

  const getNavContainerClasses = () => {
    if (isSharp) {
      return `border-t ${borderClasses} shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.45)]`;
    }
    if (isExtra) {
      return `border-t ${borderClasses} shadow-[0_-8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.5)]`;
    }
    // Default rounded
    return `border-t ${borderClasses} shadow-[0_-6px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-6px_25px_rgba(0,0,0,0.45)]`;
  };

  const getNavBgClasses = () => {
    return 'bg-white dark:bg-slate-950';
  };

  const getItemRadiusClass = () => {
    switch (cardRadius) {
      case 'sharp':
        return 'rounded-none';
      case 'extra':
        return 'rounded-full';
      case 'rounded':
      default:
        return 'rounded-xl';
    }
  };

  const allTabs = [
    { id: 'dashboard', label: t('nav_dashboard', language), icon: DashboardNavIcon },
    { id: 'transaksi', label: t('nav_transactions', language), icon: TransaksiIcon },
    { id: 'tabungan', label: t('nav_savings', language), icon: TabunganIcon },
    { id: 'tambah', label: language === 'en' ? 'Tambah' : 'Tambah', icon: Plus, isAction: true },
    { id: 'anggaran', label: t('nav_budgeting', language), icon: PieChart },
    { id: 'aktivitas', label: t('nav_activities', language), icon: Calendar },
    { id: 'kelola', label: t('nav_manage', language), icon: SlidersHorizontal },
  ];

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-40 w-full no-print select-none transition-all duration-200 ${getNavBgClasses()} ${getNavContainerClasses()}`}
      id="bottom-dock-nav"
      style={{
        boxSizing: 'border-box',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        overflow: 'hidden',
        ...getNavRadiusStyle()
      }}
    >
      {/* Ekstensi latar belakang solid ke bawah agar 100% tidak ada celah konten halaman terlihat */}
      <div 
        className="absolute left-0 right-0 top-full h-16 bg-white dark:bg-slate-950 pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="w-full max-w-lg mx-auto h-[62px] sm:h-[66px] px-1 sm:px-2 grid grid-cols-7 items-center justify-items-center">
          {allTabs.map((tab) => {
            if (tab.isAction) {
              return (
                <button
                  key="nav-action-add"
                  type="button"
                  onClick={onAddClick}
                  aria-label="Catat Baru"
                  title="Catat Baru"
                  className="group relative -translate-y-1.5 sm:-translate-y-2 flex flex-col items-center justify-center focus:outline-none select-none touch-manipulation cursor-pointer w-full h-full py-1"
                  id="center-nav-add"
                >
                  <div 
                    className={`w-10 h-10 xs:w-11 xs:h-11 rounded-full flex items-center justify-center text-white bg-gradient-to-tr ${getFabGradient()} shadow-sm hover:shadow-md group-hover:scale-105 group-active:scale-95 transition-all duration-150`}
                    style={isHex ? { backgroundColor: accentColor, backgroundImage: 'none' } : undefined}
                  >
                    <Plus className="w-5.5 h-5.5 xs:w-6 xs:h-6 stroke-[2.8]" />
                  </div>
                </button>
              );
            }

            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                title={tab.label}
                className="group relative flex flex-col items-center justify-center focus:outline-none select-none touch-manipulation cursor-pointer w-full py-1"
                id={`nav-tab-${tab.id}`}
              >
                <div 
                  className={`w-7.5 h-7.5 xs:w-8 xs:h-8 flex items-center justify-center shrink-0 ${getItemRadiusClass()} transition-all duration-150`}
                  style={isActive ? { 
                    backgroundColor: `${resolvedAccent}18`,
                    color: resolvedAccent,
                  } : undefined}
                >
                  <Icon 
                    className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.9] text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} 
                    style={isActive ? { color: resolvedAccent } : undefined} 
                  />
                </div>

                <span 
                  className={`text-[8.5px] xs:text-[9.5px] tracking-tight leading-none whitespace-nowrap text-center mt-1 transition-colors ${
                    isActive 
                      ? 'font-extrabold' 
                      : 'font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                  style={isActive ? { color: resolvedAccent } : undefined}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
  );
}
