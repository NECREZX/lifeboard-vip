/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, Sun, Moon, Settings, Trash2, FileSpreadsheet, FileText, Check, Palette, Sparkles } from 'lucide-react';
import { UserProfile, UserSettings, ThemeColor, FontStyle, UIStyle, CardStyle, TableStyle } from '../types';

interface ProfileDropdownProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  onExportExcel: () => void;
  onExportPDF: (startDate: string, endDate: string) => void;
  onDeleteAllData: () => void;
  onOpenSettings: () => void;
}

const AVATARS = [
  { id: 'male', url: '/male_avatar.jpg', label: 'Pria' },
  { id: 'female', url: '/female_avatar.jpg', label: 'Wanita' },
];

export default function ProfileDropdown({
  profile,
  setProfile,
  settings,
  setSettings,
  onExportExcel,
  onExportPDF,
  onDeleteAllData,
  onOpenSettings
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDarkMode = () => {
    const updated = !settings.isDarkMode;
    setSettings({ ...settings, isDarkMode: updated });
    if (updated) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      name: tempName.trim() || 'Pengguna',
      avatar: tempAvatar.trim() || '👤'
    });
    setIsOpen(false);
  };

  const handleThemeColorChange = (color: ThemeColor) => {
    setSettings({ ...settings, themeColor: color });
  };

  const handleFontStyleChange = (font: FontStyle) => {
    setSettings({ ...settings, fontStyle: font });
  };

  const handleUIStyleChange = (style: UIStyle) => {
    setSettings({ ...settings, uiStyle: style });
  };

  const handleCardStyleChange = (style: CardStyle) => {
    setSettings({ ...settings, cardStyle: style });
  };

  const handleTableStyleChange = (style: TableStyle) => {
    setSettings({ ...settings, tableStyle: style });
  };

  const getAccentText = () => {
    switch (settings.themeColor) {
      case 'emerald': return 'text-emerald-500';
      case 'amber': return 'text-amber-500';
      case 'rose': return 'text-rose-500';
      case 'indigo': return 'text-indigo-600 dark:text-indigo-400';
      default: return 'text-indigo-600 dark:text-indigo-400';
    }
  };

  const getAccentBg = () => {
    switch (settings.themeColor) {
      case 'emerald': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'amber': return 'bg-amber-500 hover:bg-amber-600';
      case 'rose': return 'bg-rose-500 hover:bg-rose-600';
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  const getActiveTabBorder = (color: ThemeColor) => {
    if (settings.themeColor !== color) return 'border-transparent';
    switch (color) {
      case 'emerald': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      case 'amber': return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'rose': return 'border-rose-500 bg-rose-50 dark:bg-rose-950/20';
      default: return 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20';
    }
  };

  return (
    <div className="relative no-print" ref={dropdownRef}>
      {/* Target User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition select-none focus:outline-none overflow-hidden"
        id="profile-dropdown-btn"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
          {profile.avatar.startsWith('http') || profile.avatar.startsWith('/') ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-xl" role="img" aria-label="Avatar">{profile.avatar || '👤'}</span>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[80px] truncate hidden sm:inline-block pr-2">
          {profile.name}
        </span>
      </button>

      {/* Profile Toggle Menu Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
          id="profile-menu-panel"
        >
          {/* Quick Info & Editable Form */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-2">Kelola Profil</span>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Pilih Avatar</span>
                <div className="flex gap-3">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setTempAvatar(avatar.url)}
                      className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all ${
                        tempAvatar === avatar.url 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-105' 
                          : 'border-transparent grayscale hover:grayscale-0 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {tempAvatar === avatar.url && (
                        <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-indigo-600 drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Nama Lengkap</span>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Nama Anda"
                  maxLength={18}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className={`w-full py-1.5 text-[11px] font-bold text-white rounded-xl transition ${getAccentBg()}`}
              >
                Simpan Profil
              </button>
            </form>
          </div>

          {/* Settings Lists Actions */}
          <div className="p-2 flex flex-col gap-0.5">
            {/* Darkmode toggle item */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                {settings.isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>{settings.isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {settings.isDarkMode ? 'AKTIF' : 'NON-AKTIF'}
              </span>
            </button>

            {/* Custom UI settings panel activator */}
            <button
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Pengaturan UI &amp; Gaya</span>
            </button>

            {/* Print PDF summary */}
            <div className="flex flex-col gap-2 p-2.5">
              <div className="flex gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-1/2 text-xs p-2 rounded-lg border dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-1/2 text-xs p-2 rounded-lg border dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700" />
              </div>
              <button
                onClick={() => {
                  onExportPDF(startDate, endDate);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Cetak / Simpan Laporan (PDF)</span>
              </button>
            </div>

            {/* Spreadsheet summary */}
            <button
              onClick={() => {
                onExportExcel();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Ekspor Data Excel (CSV)</span>
            </button>

            {/* Red Wipe */}
            <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
            
            <button
              onClick={() => {
                onDeleteAllData();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition text-left"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Semua Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
