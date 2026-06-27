import React from 'react';
import { LayoutDashboard, Wallet, Target, PieChart, CheckSquare, Database } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accentColor: string;
  onAddClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, accentColor, onAddClick }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transaksi', label: 'Transaksi', icon: Wallet },
    { id: 'tabungan', label: 'Tabungan', icon: Target },
    { id: 'anggaran', label: 'Anggaran', icon: PieChart },
    { id: 'aktivitas', label: 'Aktivitas', icon: CheckSquare },
    { id: 'kelola', label: 'Kelola', icon: Database },
  ];

  // Map theme colors to CSS active highlight colors
  const getActiveStyles = (isActive: boolean) => {
    if (!isActive) return 'text-slate-400 dark:text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200';
    
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
    <div className="fixed bottom-6 left-4 right-4 z-40 max-w-xl mx-auto no-print">
      <div 
        className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] px-2 py-2 flex items-center justify-between relative"
        id="bottom-dock-container"
      >
        {tabs.slice(0, 3).map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 select-none focus:outline-none touch-manipulation relative ${getActiveStyles(isActive)}`}
              id={`nav-tab-${tab.id}`}
            >
              <Icon className="w-5 h-5 stroke-[2.5]" />
              
              {isActive && (
                <span 
                  className={`absolute -bottom-1 w-5 h-1 rounded-full ${getAccentLine()} animate-in fade-in duration-300`} 
                />
              )}
            </button>
          );
        })}

        {/* Center Add Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onAddClick}
            className={`w-12 h-12 rounded-full text-white bg-gradient-to-tr ${getAccentGradient()} shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none border-4 border-slate-50 dark:border-slate-950`}
            title="Catat Baru (Pemasukan, Pengeluaran, Anggaran, Tabungan, dll)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>

        {tabs.slice(3, 6).map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 select-none focus:outline-none touch-manipulation relative ${getActiveStyles(isActive)}`}
              id={`nav-tab-${tab.id}`}
            >
              <Icon className="w-5 h-5 stroke-[2.5]" />
              
              {isActive && (
                <span 
                  className={`absolute -bottom-1 w-5 h-1 rounded-full ${getAccentLine()} animate-in fade-in duration-300`} 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
