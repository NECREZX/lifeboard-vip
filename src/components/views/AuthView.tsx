import React, { useState, useEffect } from 'react';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export const AuthView = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({
        title: 'Input Tidak Lengkap',
        text: 'Harap isi Username dan Password terlebih dahulu.',
        confirmButtonColor: '#FF7777'
      });
      return;
    }

    // Simpan di local storage
    localStorage.setItem('fin_auth', JSON.stringify({ username, password }));
    
    // Langsung masuk seketika tanpa jeda/animasi
    onLogin();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-y-auto select-none"
      style={{ backgroundColor: '#FF7777' }}
    >
      {/* Authentic Songket Weave Vector Motif (Identik dengan Banner Dashboard & Menu Pengaturan Tanpa Gradasi) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <svg className="w-full h-full opacity-20 text-white" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-songket-motif-solid" width="48" height="48" patternUnits="userSpaceOnUse">
              {/* Outer Diamond Weave */}
              <path d="M 24 0 L 48 24 L 24 48 L 0 24 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              {/* Secondary Inset Diamond */}
              <path d="M 24 6 L 42 24 L 24 42 L 6 24 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
              {/* Tertiary Inset Diamond */}
              <path d="M 24 12 L 36 24 L 24 36 L 12 24 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
              
              {/* Center Songket Floret (Pucuk Rebung / Bunga Intan) */}
              <polygon points="24,18 27,24 24,30 21,24" fill="currentColor" fillOpacity="0.6" />
              <polygon points="18,24 24,21 30,24 24,27" fill="currentColor" fillOpacity="0.6" />
              <rect x="23" y="23" width="2" height="2" fill="white" />
              
              {/* Corner Songket Cross Weaves connecting the grid */}
              <path d="M 0 0 L 6 6 M 48 0 L 42 6 M 0 48 L 6 42 M 48 48 L 42 42" stroke="currentColor" strokeWidth="1.2" />
              <polygon points="0,0 4,0 0,4" fill="currentColor" fillOpacity="0.4" />
              <polygon points="48,0 44,0 48,4" fill="currentColor" fillOpacity="0.4" />
              <polygon points="0,48 4,48 0,44" fill="currentColor" fillOpacity="0.4" />
              <polygon points="48,48 44,48 48,44" fill="currentColor" fillOpacity="0.4" />
              
              {/* Fine Songket Horizontal & Vertical Weave Ticks */}
              <line x1="24" y1="0" x2="24" y2="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
              <line x1="24" y1="42" x2="24" y2="48" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
              <line x1="0" y1="24" x2="6" y2="24" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
              <line x1="42" y1="24" x2="48" y2="24" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-songket-motif-solid)" />
        </svg>
      </div>

      {/* Modern Frameless Login Form Container (Tanpa Kotak/Card Mengambang) */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center relative z-10">
        {/* Logo & Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-3xl p-1 bg-white/20 backdrop-blur-xl border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-center mb-4">
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

        {/* Seamless Modern Input Fields */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Field 1: Username */}
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

          {/* Field 2: Password with Eye Toggle */}
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

          {/* Direct Action Button without animation delay */}
          <button
            type="submit"
            className="w-full mt-6 py-4 rounded-2xl bg-white text-[#FF7777] font-black text-sm uppercase tracking-wider shadow-lg hover:bg-white/95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 stroke-[2.5]" />
            <span>Masuk</span>
          </button>
        </form>
      </div>
    </div>
  );
};
