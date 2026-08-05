/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Check, Trash2, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { NotificationIcon as CustomNotificationIcon } from './CustomIcons';
import { NotificationItem } from '../types';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onToggleRead: (id: string) => void;
  onDeleteOne: (id: string) => void;
  accentColor: string;
  uiStyle?: 'modern' | 'glass';
}

export default function NotificationPanel({
  notifications,
  isOpen,
  setIsOpen,
  onMarkAllRead,
  onClearAll,
  onToggleRead,
  onDeleteOne,
  accentColor,
  uiStyle = 'glass'
}: NotificationPanelProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
  }, [isOpen, setIsOpen]);

  const getAccentText = () => {
    switch (accentColor) {
      case 'emerald': return 'text-emerald-500';
      case 'amber': return 'text-amber-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-indigo-600 dark:text-indigo-400';
    }
  };

  const getAccentBg = () => {
    switch (accentColor) {
      case 'emerald': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'rose': return 'bg-rose-500';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="relative no-print" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative focus:outline-none"
        id="notification-toggle-btn"
      >
        <CustomNotificationIcon className="w-5.5 h-5.5" />
        {unreadCount > 0 && (
          <span className={`absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse ${getAccentBg()}`}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div 
          className={`fixed sm:absolute left-1/2 sm:left-auto sm:right-0 sm:translate-x-0 -translate-x-1/2 top-20 sm:top-full mt-2 w-[calc(100vw-32px)] sm:w-96 rounded-3xl z-50 overflow-hidden transition-all ${
            uiStyle === 'glass' 
              ? 'glass-panel !border-white dark:!border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)]' 
              : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.12)]'
          }`}
          id="notification-dropdown-panel"
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between transition-all ${
            uiStyle === 'glass'
              ? 'bg-white/20 dark:bg-slate-900/30 backdrop-blur-md border-white/40 dark:border-white/10'
              : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  uiStyle === 'glass'
                    ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {unreadCount} Baru
                </span>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={onMarkAllRead}
                  className={`text-xs font-bold flex items-center gap-0.5 hover:opacity-80 transition ${getAccentText()}`}
                  title="Tandai semua telah dibaca"
                >
                  <Check className="w-3.5 h-3.5" /> Baca Semua
                </button>
                <button
                  onClick={onClearAll}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-0.5 transition"
                  title="Hapus semua notifikasi"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                </button>
              </div>
            )}
          </div>

          {/* List content */}
          <div className={`max-h-[340px] overflow-y-auto divide-y ${
            uiStyle === 'glass' ? 'divide-white/30 dark:divide-white/10' : 'divide-slate-100 dark:divide-slate-800'
          }`}>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
                <CustomNotificationIcon className="w-10 h-10 opacity-50" />
                <p className="text-xs font-semibold">Tidak ada notifikasi baru</p>
              </div>
            ) : (
              notifications.map((n) => {
                // Determine icon based on type
                let NotificationIcon = Info;
                let iconColor = uiStyle === 'glass' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-500/15 border border-blue-500/20'
                  : 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
                
                if (n.type === 'warning') {
                  NotificationIcon = AlertTriangle;
                  iconColor = uiStyle === 'glass'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/20'
                    : 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
                } else if (n.type === 'success') {
                  NotificationIcon = CheckCircle;
                  iconColor = uiStyle === 'glass'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/20'
                    : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
                }

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 flex items-start gap-3 transition-colors duration-200 relative ${
                      n.isRead 
                        ? 'bg-transparent hover:bg-white/30 dark:hover:bg-white/5' 
                        : (uiStyle === 'glass' ? 'bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15' : 'bg-slate-50/70 dark:bg-slate-800/20')
                    }`}
                  >
                    {/* Unread blue dot */}
                    {!n.isRead && (
                      <span className={`absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full ${getAccentBg()}`}></span>
                    )}

                    {/* Left Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                      <NotificationIcon className="w-4.5 h-4.5" />
                    </div>

                    {/* Middle Text */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className={`text-xs text-slate-950 dark:text-white leading-snug ${n.isRead ? 'font-semibold' : 'font-extrabold'}`}>
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-sans break-words font-medium">
                        {n.message}
                      </p>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-semibold block mt-1">
                        {n.date}
                      </span>
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-col gap-1 shrink-0 justify-center h-full">
                      <button
                        onClick={() => onToggleRead(n.id)}
                        className={`p-1 rounded-lg text-slate-500 hover:bg-white/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition ${n.isRead ? 'opacity-40' : 'opacity-100'}`}
                        title={n.isRead ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteOne(n.id)}
                        className="p-1 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer view */}
          <div className={`p-2.5 border-t text-center transition-all ${
            uiStyle === 'glass'
              ? 'bg-white/20 dark:bg-slate-900/30 backdrop-blur-md border-white/40 dark:border-white/10'
              : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800'
          }`}>
            <button 
              onClick={() => setIsOpen(false)}
              className={`text-[10px] font-black tracking-wider uppercase hover:opacity-85 transition px-4 py-1.5 rounded-xl ${
                uiStyle === 'glass'
                  ? 'text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Tutup Panel Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
