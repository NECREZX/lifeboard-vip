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
    <div className="flex flex-col gap-6" id="view-savings">
      <div className="mb-2">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Tabungan</h1>
      </div>

      <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 w-fit backdrop-blur-sm">
        <button
          onClick={() => setSavingFilter('semua')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            savingFilter === 'semua'
              ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-sm shadow-slate-900/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <span>Semua</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
            savingFilter === 'semua'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {savings.length}
          </span>
        </button>
        <button
          onClick={() => setSavingFilter('berjalan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            savingFilter === 'berjalan'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <span>Berjalan</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
            savingFilter === 'berjalan'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {savings.filter((s) => s.currentAmount < s.targetAmount).length}
          </span>
        </button>
        <button
          onClick={() => setSavingFilter('tercapai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            savingFilter === 'tercapai'
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <span>Tercapai</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
            savingFilter === 'tercapai'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {savings.filter((s) => s.currentAmount >= s.targetAmount).length}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div key={s.id} className={getCardClasses() + " p-4 flex flex-col justify-between gap-3 min-h-[160px] relative"}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{s.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                      Tenggat: {new Date(s.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteSaving(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-500 text-[11px]">Progres</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {formatIDR(s.currentAmount)} / {formatIDR(s.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1 text-right">{pct.toFixed(0)}% Terkumpul</span>
                </div>

                {!isDone && (
                  <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
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
                  <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1 tracking-wider shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" /> Target Tercapai
                    </span>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
