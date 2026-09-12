/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Search, 
  X, 
  Inbox,
  ChevronDown,
  Home,
  Bell
} from 'lucide-react';
import { NotificationItem, UserSettings } from '../../types';
import { Breadcrumb } from '../Breadcrumb';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onToggleRead: (id: string) => void;
  onDeleteOne: (id: string) => void;
  onBack?: () => void;
  getCardClasses: () => string;
  getAccentBg: () => string;
  settings: UserSettings;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  onClearAll,
  onToggleRead,
  onDeleteOne,
  onBack,
  getCardClasses,
  getAccentBg,
  settings
}) => {
  const [statusFilter, setStatusFilter] = useState<'semua' | 'unread' | 'read'>('semua');
  const [typeFilter, setTypeFilter] = useState<'semua' | 'warning' | 'success' | 'info'>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  const warningCount = useMemo(() => notifications.filter(n => n.type === 'warning').length, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Status filter
      if (statusFilter === 'unread' && n.isRead) return false;
      if (statusFilter === 'read' && !n.isRead) return false;

      // Type filter
      if (typeFilter !== 'semua' && n.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMessage = n.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage) return false;
      }

      return true;
    });
  }, [notifications, statusFilter, typeFilter, searchQuery]);

  const getAccentText = () => {
    switch (settings.themeColor) {
      case 'emerald': return 'text-emerald-500 dark:text-emerald-400';
      case 'amber': return 'text-amber-500 dark:text-amber-400';
      case 'rose': return 'text-rose-500 dark:text-rose-400';
      case 'classic': return 'text-slate-700 dark:text-slate-300';
      default: return 'text-indigo-600 dark:text-indigo-400';
    }
  };

  const getNotificationIconInfo = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          icon: AlertTriangle,
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          label: 'Peringatan'
        };
      case 'success':
        return {
          icon: CheckCircle2,
          badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          label: 'Sukses'
        };
      default:
        return {
          icon: Info,
          badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          label: 'Informasi'
        };
    }
  };

  return (
    <div className="flex flex-col gap-3.5" id="view-notifications-full">
      <Breadcrumb 
        items={[
          { label: 'Dashboard', onClick: onBack },
          { label: 'Pusat Notifikasi' }
        ]} 
      />

      {/* 1. Ringkasan Kartu (Hanya Teks, Tanpa Icon, Ukuran Ringkas) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        <div className={`${getCardClasses()} p-2.5 sm:p-3 flex flex-col justify-center`}>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Notifikasi</span>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {notifications.length}
          </p>
        </div>

        <div className={`${getCardClasses()} p-2.5 sm:p-3 flex flex-col justify-center`}>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">Belum Dibaca</span>
          <p className={`text-base sm:text-lg font-black mt-0.5 ${unreadCount > 0 ? getAccentText() : 'text-slate-900 dark:text-white'}`}>
            {unreadCount}
          </p>
        </div>

        <div className={`${getCardClasses()} p-2.5 sm:p-3 flex flex-col justify-center`}>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">Peringatan</span>
          <p className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {warningCount}
          </p>
        </div>
      </div>

      {/* 2. Filter Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari notifikasi berdasarkan judul atau pesan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 text-xs font-medium rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. Filter Data (Semua Tipe & Status Sejajar Sempurna, Teks Utuh Tanpa Terpotong dan Tanpa Scroll) */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 w-full">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setStatusFilter('semua')}
            className={`flex-1 text-center py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'semua'
                ? 'bg-blue-600 text-white dark:bg-blue-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Semua
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('unread')}
            className={`flex-1 text-center py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'unread'
                ? 'bg-red-600 text-white dark:bg-red-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Belum Dibaca
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('read')}
            className={`flex-1 text-center py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'read'
                ? 'bg-emerald-600 text-white dark:bg-emerald-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Sudah Dibaca
          </button>
        </div>

        {/* Type Filter Dropdown - Full Text Guaranteed With Custom Arrow */}
        <div className="relative shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            aria-label="Filter tipe notifikasi"
            className="appearance-none pl-2.5 pr-6 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="semua">Semua Tipe</option>
            <option value="warning">Peringatan</option>
            <option value="success">Sukses</option>
            <option value="info">Informasi</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 4. Action Buttons: Tandai Semua Dibaca & Hapus Semua (Placed below filters) */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-end gap-2 pt-0.5">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200/60 dark:border-slate-700"
              id="notif-mark-all-read-btn"
            >
              <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
            id="notif-clear-all-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua</span>
          </button>
        </div>
      )}

      {/* 5. Notification List (Compact Card Dimensions) */}
      <div className="flex flex-col gap-2.5">
        {filteredNotifications.length === 0 ? (
          <div className={`${getCardClasses()} p-8 text-center flex flex-col items-center justify-center gap-2.5`}>
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                {notifications.length === 0 ? 'Belum Ada Notifikasi' : 'Tidak Ada Notifikasi Sesuai Filter'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-sm">
                {notifications.length === 0 
                  ? 'Pemberitahuan terkait anggaran dan transaksi akan otomatis tercatat di sini.'
                  : 'Coba ganti filter status atau kata kunci pencarian.'}
              </p>
            </div>
            {(statusFilter !== 'semua' || typeFilter !== 'semua' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setStatusFilter('semua');
                  setTypeFilter('semua');
                  setSearchQuery('');
                }}
                className="mt-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const { icon: IconComp, badgeBg, iconColor, label } = getNotificationIconInfo(n.type);

            return (
              <div
                key={n.id}
                className={`${getCardClasses()} p-3 sm:p-3.5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative overflow-hidden ${
                  !n.isRead ? 'ring-1 ring-indigo-500/30 dark:ring-indigo-400/30' : ''
                }`}
              >
                {/* Unread Left Border / Indicator */}
                {!n.isRead && (
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${getAccentBg()}`} />
                )}

                <div className="flex items-start gap-2.5 flex-1 min-w-0 pl-0.5">
                  {/* Type Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${badgeBg}`}>
                    <IconComp className={`w-4 h-4 ${iconColor}`} />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className={`text-xs text-slate-900 dark:text-white leading-snug ${n.isRead ? 'font-semibold' : 'font-extrabold'}`}>
                        {n.title}
                      </h4>
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${badgeBg}`}>
                        {label}
                      </span>
                      {!n.isRead && (
                        <span className="text-[9.5px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.2 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                          Baru
                        </span>
                      )}
                    </div>

                    <p className="text-[11.5px] text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-sans break-words font-medium">
                      {n.message}
                    </p>

                    <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">
                      {n.date}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onToggleRead(n.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      n.isRead
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                    }`}
                    title={n.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                  >
                    <Check className="w-3 h-3" />
                    <span>{n.isRead ? 'Belum Dibaca' : 'Sudah Dibaca'}</span>
                  </button>
                  <button
                    onClick={() => onDeleteOne(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Hapus notifikasi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
