import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  WifiOff, 
  Bot 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { UserSettings } from '../../types';
import { getEffectiveThemeColor, getThemeContrastColor } from '../../lib/theme';
import { BannerMotifOverlay } from '../BannerMotif';

interface AuthViewProps {
  onLogin: () => void;
  settings?: UserSettings;
}

export const AuthView = ({ onLogin, settings }: AuthViewProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isDark = !!settings?.isDarkMode;
  const rawThemeColor = getEffectiveThemeColor(settings);
  const activeThemeColor = rawThemeColor;
  const contrastColor = getThemeContrastColor(rawThemeColor);

  useEffect(() => {
    // Status bar HP bawaan (bagian atas) mengikuti tema kustomisasi warna aktif
    const metaTheme = document.querySelector("meta[name=theme-color]");
    if (metaTheme) {
      metaTheme.setAttribute("content", activeThemeColor);
    }
    const msMeta = document.querySelector("meta[name=msapplication-navbutton-color]");
    if (msMeta) {
      msMeta.setAttribute("content", activeThemeColor);
    }
    // Navigasi sistem bawaan HP (bagian bawah) menyatu dengan background putih (#ffffff) / #121212
    const sysBgColor = isDark ? '#121212' : '#ffffff';
    document.documentElement.style.backgroundColor = sysBgColor;

    // Cek jika sudah pernah login sebelumnya
    const savedAuth = localStorage.getItem('fin_auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.username && parsed.password) {
          setUsername(parsed.username);
          setPassword(parsed.password);
        }
      } catch (e) {
        // Abaikan
      }
    }
  }, [rawThemeColor, isDark]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({
        title: 'Input Tidak Lengkap',
        text: 'Harap isi Username dan Password terlebih dahulu.',
        confirmButtonColor: activeThemeColor
      });
      return;
    }

    // Simpan di local storage
    localStorage.setItem('fin_auth', JSON.stringify({ username, password }));
    
    // Langsung masuk seketika tanpa jeda/animasi
    onLogin();
  };

  const handleFeatureClick = (title: string, desc: string) => {
    Swal.fire({
      title: title,
      text: desc,
      confirmButtonColor: activeThemeColor,
      confirmButtonText: 'Tutup'
    });
  };

  // 3 Badge Fitur Unggulan Keamanan & Fitur Pintar (Ala Quick Action Livin' Mandiri)
  const securityFeatures = [
    {
      id: 'keamanan',
      name: 'Data Aman',
      desc: 'Seluruh data keuangan tersimpan aman dengan enkripsi lokal di perangkat Anda.',
      icon: ShieldCheck,
      bg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
    },
    {
      id: 'offline',
      name: '100% Offline',
      desc: 'Bebas akses kapan saja tanpa memerlukan kuota data atau koneksi internet.',
      icon: WifiOff,
      bg: 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
    },
    {
      id: 'ai',
      name: 'Terintegrasi AI',
      desc: 'Didukung kecerdasan buatan Lifeboard AI untuk analisis finansial bulanan dan rekomendasi otomatis.',
      icon: Bot,
      bg: 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
    }
  ];

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto select-none transition-colors duration-200 ${isDark ? 'dark bg-[#121212]' : 'bg-white'}`}
      style={{ backgroundColor: isDark ? '#121212' : '#ffffff' }}
    >
      <form onSubmit={handleSubmit} className="min-h-[100dvh] flex flex-col justify-between relative z-10 w-full">
        {/* ========================================================
            BAGIAN ATAS: HERO BANNER LOGIN
            Persis Identik 100% dengan Banner Menu Dashboard & Menu Pengaturan
            (Warna Tema Kustom / #1e1e1e di Dark Mode, Mask Gradasi Pudar, Pattern Songket, Mix-blend & Glow)
            ======================================================== */}
        <div 
          className="relative z-0 overflow-hidden text-white flex-1 flex flex-col justify-center items-center px-6 pt-10 sm:pt-14 pb-8 w-full transition-colors duration-200"
          style={{ 
            backgroundColor: activeThemeColor,
            color: contrastColor,
            paddingTop: 'max(env(safe-area-inset-top), 24px)' 
          }}
        >
          {/* Authentic Indonesian Songket Weave Vector Motif (Identik 100% dengan Banner Dashboard & Kelola) */}
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 22%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.9) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 22%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.9) 100%)'
            }}
          >
            <BannerMotifOverlay motif={settings?.bannerMotif} idPrefix="auth-banner" />
          </div>

          {/* Form Content: Logo, Title, Username, Password */}
          <div className="relative z-10 max-w-sm mx-auto w-full flex flex-col items-center">
            {/* Logo & Header */}
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl p-1 bg-white/20 backdrop-blur-xl border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-center mb-3.5">
                <img 
                  src="/icon.svg" 
                  className="w-full h-full object-cover scale-[1.15]" 
                  alt="Lifeboard Logo" 
                  referrerPolicy="no-referrer" 
                />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                Lifeboard
              </h1>
            </div>

            {/* Inputs */}
            <div className="w-full space-y-3.5 sm:space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/90 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-white/80" />
                  <span>Username</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan Username Anda"
                    autoComplete="username"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/20 focus:bg-white/25 border border-white/30 focus:border-white text-white placeholder:text-white/60 text-sm font-medium tracking-wide backdrop-blur-xl shadow-inner outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/90 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-white/80" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password Anda"
                    autoComplete="current-password"
                    className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white/15 hover:bg-white/20 focus:bg-white/25 border border-white/30 focus:border-white text-white placeholder:text-white/60 text-sm font-medium tracking-wide backdrop-blur-xl shadow-inner outline-none focus:ring-2 focus:ring-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* ========================================================
            BAGIAN BAWAH:
            Card Pembungkus Ala Livin' Mandiri yang Menyatu dengan
            Warna Navigasi Sistem HP (3 Badge Fitur + Button Masuk)
            Sudut Atas Konsisten 40px
            ======================================================== */}
        <div 
          className="relative z-20 -mt-8 sm:-mt-10 bg-white dark:bg-[#121212] rounded-t-[40px] sm:rounded-t-[40px] shadow-[0_-12px_36px_rgba(0,0,0,0.12)] pt-6 px-6 pb-6 w-full border-t border-slate-100/60 dark:border-slate-800/80"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
        >
          <div className="max-w-sm mx-auto flex flex-col gap-5">
            {/* 3 Quick Action Badges: Data Aman, 100% Offline, Terintegrasi AI */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 justify-items-center max-w-[320px] mx-auto w-full">
              {securityFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFeatureClick(f.name, f.desc)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer w-full focus:outline-none"
                  >
                    <div className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 group-active:scale-95 ${f.bg}`}>
                      <Icon className="w-5.5 h-5.5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-200 tracking-tight text-center leading-tight w-full">
                      {f.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tombol Aksi Utama: Masuk (Langsung Masuk Tanpa Delay) */}
            <button
              type="submit"
              style={{
                backgroundColor: settings?.isDarkMode && (rawThemeColor === '#0F172A' || rawThemeColor === '#020617') ? '#ffffff' : rawThemeColor,
                color: settings?.isDarkMode && (rawThemeColor === '#0F172A' || rawThemeColor === '#020617') ? '#0f172a' : contrastColor,
                boxShadow: `0 8px 24px ${settings?.isDarkMode && (rawThemeColor === '#0F172A' || rawThemeColor === '#020617') ? 'rgba(255,255,255,0.25)' : `${rawThemeColor}50`}`
              }}
              className="w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-105 active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Masuk</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
