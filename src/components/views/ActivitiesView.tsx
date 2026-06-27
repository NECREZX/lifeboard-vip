/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, CheckCircle, Circle, Calendar, Bookmark, Edit2, PlusCircle, ShoppingBag, CheckSquare } from 'lucide-react';
import { Activity, Wishlist } from '../../types';
import { formatIDR } from '../../lib/formatters';

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
  onEditWishlist
}) => {
  return (
    <div className="flex flex-col gap-5" id="view-activities">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Aktivitas dan Wishlist</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('agenda')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${activeSubTab === 'agenda' ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            <CheckSquare className="w-4 h-4" /> Agenda Kerja
          </button>
          <button
            onClick={() => setActiveSubTab('wishlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${activeSubTab === 'wishlist' ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            <ShoppingBag className="w-4 h-4" /> Daftar Keinginan
          </button>
        </div>
      </div>

      {activeSubTab === 'agenda' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              Belum ada agenda aktivitas terjadwal.
            </div>
          ) : (
            activities.map((a) => {
              const isDone = a.status === 'completed';
              return (
                <div key={a.id} className={getCardClasses() + ` p-4 flex flex-col gap-3 transition-all duration-300 ${isDone ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40 grayscale-[0.5]' : 'hover:border-indigo-200 dark:hover:border-indigo-900'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => handleToggleActivity(a.id)} className={`shrink-0 mt-0.5 transition ${isDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700 hover:text-indigo-400'}`}>
                      {isDone ? <CheckCircle className="w-5 h-5 fill-emerald-50 dark:fill-emerald-950/30" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-bold text-sm leading-snug transition ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{a.title}</h4>
                      {a.description && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{a.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onEditActivity(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteActivity(a.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlists.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              Daftar keinginan masih kosong.
            </div>
          ) : (
            wishlists.map((w) => (
              <div key={w.id} className={getCardClasses() + ` p-4 flex flex-col gap-3 transition-all duration-300 ${w.isPurchased ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40 grayscale-[0.5]' : 'hover:border-indigo-200 dark:hover:border-indigo-900'}`}>
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => handleToggleWishlist(w.id)} className={`shrink-0 mt-0.5 transition ${w.isPurchased ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700 hover:text-indigo-400'}`}>
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
                    <button onClick={() => onEditWishlist(w)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteWishlist(w.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShoppingBag className="w-3 h-3" />
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
