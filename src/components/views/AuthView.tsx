import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User, Lock, Layout } from 'lucide-react';
import Swal from 'sweetalert2';

export const AuthView = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isExiting, setIsExiting] = useState(false);

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
        icon: 'error',
        title: 'Input Tidak Lengkap',
        text: 'Harap isi Username dan Password terlebih dahulu.',
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    // Simpan di local storage
    localStorage.setItem('fin_auth', JSON.stringify({ username, password }));
    
    // Trigger animasi keluar
    setIsExiting(true);
    
    // Panggil onLogin setelah animasi selesai (misal 500ms)
    setTimeout(() => {
      onLogin();
    }, 500);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z-40 p-4"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm bg-gradient-to-br from-[#FF9999] via-[#FF7777] to-[#E56666] rounded-3xl shadow-2xl overflow-hidden border border-white/20 text-white relative"
          >
            {/* Semi-circle Polkadot (Setengah Lingkaran) Motif Pattern Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-15">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="auth-semicircle-polkadot" width="28" height="28" patternUnits="userSpaceOnUse">
                    {/* Semi-circles facing up and down forming scalloped polkadot fan texture */}
                    <path d="M 0 14 A 7 7 0 0 1 14 14 Z" fill="white" />
                    <path d="M 14 14 A 7 7 0 0 0 28 14 Z" fill="white" />
                    <path d="M 7 0 A 7 7 0 0 1 21 0 Z" fill="white" />
                    <path d="M 7 28 A 7 7 0 0 0 21 28 Z" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#auth-semicircle-polkadot)" />
              </svg>
            </div>

            <div className="p-8 pb-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-lg relative z-10 mb-4 border border-white/20 bg-transparent">
                <img src="/icon.svg" className="w-full h-full object-cover scale-[1.15]" alt="Lifeboard Logo" referrerPolicy="no-referrer" />
              </div>
              <h2 className="text-3xl font-bold text-white relative z-10 tracking-tight">Lifeboard</h2>
              <p className="text-white/90 text-xs font-medium tracking-wide uppercase mt-2 relative z-10 text-center">Masuk atau Daftar Sekali</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-4 relative z-10">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan Username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan Password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-8 bg-white text-[#E56666] hover:bg-rose-50 active:bg-rose-100 font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Masuk
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
