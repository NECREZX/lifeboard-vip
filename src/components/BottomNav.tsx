import React from 'react';
import { PieChart, SlidersHorizontal } from 'lucide-react';
import { DashboardNavIcon, TransaksiIcon, TabunganIcon, AktivitasIcon } from './CustomIcons';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accentColor: string;
  onAddClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, accentColor, onAddClick }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: DashboardNavIcon },
    { id: 'transaksi', label: 'Transaksi', icon: TransaksiIcon },
    { id: 'tabungan', label: 'Tabungan', icon: TabunganIcon },
    { id: 'anggaran', label: 'Anggaran', icon: PieChart },
    { id: 'aktivitas', label: 'Aktivitas', icon: AktivitasIcon },
    { id: 'kelola', label: 'Kelola', icon: SlidersHorizontal },
  ];

  const isHex = accentColor.startsWith('#');

  // Map theme colors to CSS active highlight colors
  const getActiveStyles = (isActive: boolean) => {
    if (!isActive) return 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200';
    if (isHex) return '';
    
    switch (accentColor) {
      case 'emerald': return 'text-emerald-500 dark:text-emerald-400';
      case 'amber': return 'text-amber-500 dark:text-amber-400';
      case 'rose': return 'text-rose-500 dark:text-rose-400';
      case 'indigo': return 'text-indigo-500 dark:text-indigo-400';
      case 'classic': return 'text-slate-900 dark:text-white';
      default: return 'text-indigo-500 dark:text-indigo-400';
    }
  };

  const getAccentGradient = () => {
    if (isHex) return '';
    switch (accentColor) {
      case 'emerald': return 'from-emerald-400 to-emerald-500';
      case 'amber': return 'from-amber-400 to-amber-500';
      case 'rose': return 'from-rose-400 to-rose-500';
      case 'indigo': return 'from-indigo-500 to-indigo-600';
      case 'classic': return 'from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800';
      default: return 'from-indigo-500 to-indigo-600';
    }
  };

  const getAccentLine = () => {
    if (isHex) return '';
    switch (accentColor) {
      case 'emerald': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'rose': return 'bg-rose-500';
      case 'indigo': return 'bg-indigo-500';
      case 'classic': return 'bg-slate-900 dark:bg-white';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-3 sm:px-4 max-w-2xl mx-auto pointer-events-none no-print">
      <div 
        className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-1.5 grid grid-cols-7 items-center justify-items-center relative w-full"
        id="bottom-dock-container"
      >
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
                  className={`absolute -bottom-1 w-4 h-0.5 rounded-full ${getAccentLine()} animate-in fade-in duration-300`} 
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
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white bg-gradient-to-tr ${getAccentGradient()} shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none border-4 border-slate-50 dark:border-slate-950 shrink-0`}
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
                  className={`absolute -bottom-1 w-4 h-0.5 rounded-full ${getAccentLine()} animate-in fade-in duration-300`} 
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

