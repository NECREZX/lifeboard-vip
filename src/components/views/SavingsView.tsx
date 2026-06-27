/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, Check, Edit2, PlusCircle } from 'lucide-react';
import { Saving } from '../../types';
import { formatIDR } from '../../lib/formatters';

interface SavingsViewProps {
  savings: Saving[];
  savingFilter: 'semua' | 'berjalan' | 'tercapai';
  setSavingFilter: (val: 'semua' | 'berjalan' | 'tercapai') => void;
  getCardClasses: () => string;
  handleDeleteSaving: (id: string) => void;
  handleSavingAddAmount: (id: string, amount: string) => void;
  onEdit: (saving: Saving) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  savings,
  savingFilter,
  setSavingFilter,
  getCardClasses,
  handleDeleteSaving,
  handleSavingAddAmount,
  onAdd,
  onEdit
}) => {
  return (
    <div className="flex flex-col gap-5" id="view-savings">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Tabungan</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSavingFilter('semua')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${savingFilter === 'semua' ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
        >
          Semua Target
        </button>
        <button
          onClick={() => setSavingFilter('berjalan')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${savingFilter === 'berjalan' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
        >
          Berjalan
        </button>
        <button
          onClick={() => setSavingFilter('tercapai')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${savingFilter === 'tercapai' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
        >
          Tercapai 🎉
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savings
          .filter((s) => {
            if (savingFilter === 'berjalan') return s.currentAmount < s.targetAmount;
            if (savingFilter === 'tercapai') return s.currentAmount >= s.targetAmount;
            return true;
          })
          .map((s) => {
            const pct = Math.min((s.currentAmount / s.targetAmount) * 100, 100);
            const isDone = s.currentAmount >= s.targetAmount;
            
            return (
              <div key={s.id} className={getCardClasses() + " p-5 flex flex-col justify-between min-h-[220px] h-auto relative"}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{s.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                      Tenggat: {new Date(s.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteSaving(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-2.5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-500">Progres Pengumpulan</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatIDR(s.currentAmount)} / {formatIDR(s.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1 text-right">{pct.toFixed(0)}% Terkumpul</span>
                </div>

                {!isDone && (
                  <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <input
                      type="number"
                      placeholder="Tambah tabungan (Rp)"
                      id={`add-saving-${s.id}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSavingAddAmount(s.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-[11px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`add-saving-${s.id}`) as HTMLInputElement;
                        if (input) {
                          handleSavingAddAmount(s.id, input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider shadow-sm transition shrink-0 bg-indigo-600"
                    >
                      Tambah
                    </button>
                  </div>
                )}

                {isDone && (
                  <div className="absolute right-4 bottom-4 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1 tracking-wider shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" /> Target Tercapai
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
