/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, AlertTriangle, Edit2, PlusCircle } from 'lucide-react';
import { Budget, Category, Transaction } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  getCardClasses: () => string;
  handleDeleteBudget: (id: string) => void;
  onEdit: (budget: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  transactions,
  getCardClasses,
  handleDeleteBudget,
  onAdd,
  onEdit
}) => {
  return (
    <div className="flex flex-col gap-5" id="view-budgeting">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Budgeting</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          const currentSpend = transactions
            .filter((t) => t.type === 'pengeluaran' && t.categoryId === b.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);

          const pct = Math.min((currentSpend / b.limitAmount) * 100, 100);
          const isOver = currentSpend > b.limitAmount;
          const remaining = b.limitAmount - currentSpend;

          return (
            <div key={b.id} className={getCardClasses() + " p-5 flex flex-col justify-between min-h-[160px] relative"}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">
                    {cat?.icon && <IconRenderer name={cat.icon} className="w-8 h-8" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{cat?.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Bulan: {b.month}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteBudget(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="my-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-500">Pemakaian Anggaran</span>
                  <span className={`font-mono font-bold ${isOver ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {formatIDR(currentSpend)} / {formatIDR(b.limitAmount)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : pct > 85 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                   <span className={`text-[10px] font-bold uppercase tracking-wider ${isOver ? 'text-rose-500' : 'text-slate-400'}`}>
                    {isOver ? 'MELEBIHI LIMIT!' : `Sisa: ${formatIDR(remaining)}`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{pct.toFixed(0)}%</span>
                </div>
              </div>

              {isOver && (
                <div className="mt-1 flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-900/50">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Peringatan Overbudget</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
