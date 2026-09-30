/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Trash2, CheckCircle, Circle, Calendar, Bookmark, Edit2, PlusCircle, ChevronDown } from 'lucide-react';
import { Activity, Wishlist } from '../../types';
import { formatIDR } from '../../lib/formatters';
import { AgendaKerjaIcon, WishlistIcon } from '../CustomIcons';

interface ActivitiesViewProps {
  activities: Activity[];
  wishlists: Wishlist[];
  activeSubTab: 'agenda' | 'wishlist';
  setActiveSubTab: (tab: 'agenda' | 'wishlist') => void;
  getCardClasses: () => string;
  handleDeleteActivity: (id: string) => void;
  handleToggleActivity: (id: string) => void;
  handleDeleteWishlist: (id: string) => void;
  handleToggleWishlist: (id: string) => void;
  onEditActivity: (activity: Activity) => void;
  onEditWishlist: (wishlist: Wishlist) => void;
  settings?: any;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  wishlists,
  activeSubTab,
  setActiveSubTab,
  getCardClasses,
  handleDeleteActivity,
  handleToggleActivity,
  handleDeleteWishlist,
  handleToggleWishlist,
  onEditActivity,
  onEditWishlist,
  settings
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const btnRadius = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-2xl' : 'rounded-xl';

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (statusFilter === 'pending') return a.status !== 'completed';
      if (statusFilter === 'completed') return a.status === 'completed';
      return true;
    });
  }, [activities, statusFilter]);

  const filteredWishlists = useMemo(() => {
    return wishlists.filter((w) => {
      if (statusFilter === 'pending') return !w.isPurchased;
      if (statusFilter === 'completed') return Boolean(w.isPurchased);
      return true;
    });
  }, [wishlists, statusFilter]);

  return (
    <div className="flex flex-col gap-6" id="view-activities">
      {/* Filter Selectors (Matching Budgeting Concept Exactly) */}
      <div className="flex items-center justify-end w-full">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Tipe / SubTab Selector Dropdown Card */}
          <div className={`relative flex items-center justify-between gap-1.5 px-3 py-2 ${btnRadius} transition-all min-w-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs`}>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              Tipe:
            </span>
            <div className="relative flex items-center min-w-0 flex-1 justify-end">
              <select
                value={activeSubTab}
                onChange={(e) => {
                  setActiveSubTab(e.target.value as 'agenda' | 'wishlist');
                  setStatusFilter('all');
                }}
                className="text-[11px] sm:text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-0 pl-1 pr-4 min-w-0 w-full truncate text-right appearance-none"
              >
                <option value="agenda">Agenda Kerja</option>
                <option value="wishlist">Daftar Keinginan</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-0 shrink-0" />
            </div>
          </div>

          {/* Status Selector Dropdown Card */}
          <div className={`relative flex items-center justify-between gap-1.5 px-3 py-2 ${btnRadius} transition-all min-w-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs`}>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <div className="relative flex items-center min-w-0 flex-1 justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[11px] sm:text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-0 pl-1 pr-4 min-w-0 w-full truncate text-right appearance-none"
              >
                <option value="all">Semua</option>
                {activeSubTab === 'agenda' ? (
                  <>
                    <option value="pending">Belum Selesai</option>
                    <option value="completed">Selesai</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Rencana</option>
                    <option value="completed">Terbeli</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-0 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {activeSubTab === 'agenda' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredActivities.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              {activities.length === 0 
                ? 'Belum ada agenda aktivitas terjadwal.' 
                : 'Tidak ada agenda aktivitas sesuai filter status.'}
            </div>
          ) : (
            filteredActivities.map((a) => {
              const isDone = a.status === 'completed';
              return (
                <div key={a.id} className={getCardClasses() + ` p-4 flex flex-col gap-3 transition-all duration-300 ${isDone ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40 grayscale-[0.5]' : 'hover:border-indigo-200 dark:hover:border-indigo-900'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => handleToggleActivity(a.id)} className={`shrink-0 mt-0.5 transition cursor-pointer ${isDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700 hover:text-indigo-400'}`}>
                      {isDone ? <CheckCircle className="w-5 h-5 fill-emerald-50 dark:fill-emerald-950/30" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-bold text-sm leading-snug transition ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{a.title}</h4>
                      {a.description && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{a.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onEditActivity(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteActivity(a.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {new Date(a.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      <Bookmark className="w-2.5 h-2.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Agenda</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredWishlists.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              {wishlists.length === 0 
                ? 'Daftar keinginan masih kosong.' 
                : 'Tidak ada daftar keinginan sesuai filter status.'}
            </div>
          ) : (
            filteredWishlists.map((w) => (
              <div key={w.id} className={getCardClasses() + ` p-4 flex flex-col gap-3 transition-all duration-300 ${w.isPurchased ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40 grayscale-[0.5]' : 'hover:border-indigo-200 dark:hover:border-indigo-900'}`}>
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => handleToggleWishlist(w.id)} className={`shrink-0 mt-0.5 transition cursor-pointer ${w.isPurchased ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700 hover:text-indigo-400'}`}>
                    {w.isPurchased ? <CheckCircle className="w-5 h-5 fill-emerald-50 dark:fill-emerald-950/30" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm leading-snug transition ${w.isPurchased ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{w.title}</h4>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Target: {w.month}</p>
                      {w.price && <p className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold">{formatIDR(w.price)}</p>}
                      {w.notes && <p className="text-[10px] text-slate-400 dark:text-slate-500 italic line-clamp-1">"{w.notes}"</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEditWishlist(w)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteWishlist(w.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <WishlistIcon className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Wishlist</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${w.isPurchased ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{w.isPurchased ? 'Terbeli' : 'Rencana'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
