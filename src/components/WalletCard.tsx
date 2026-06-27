/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Wallet } from '../types';
import { IconRenderer } from './IconRenderer';

interface WalletCardProps {
  key?: string;
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (id: string) => void;
  cardStyle: 'flat' | 'bordered' | 'shadowed';
  isDarkMode: boolean;
}

export default function WalletCard({ wallet, onEdit, onDelete, cardStyle, isDarkMode }: WalletCardProps) {
  const formatIDR = (num: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div 
      className={`p-4 rounded-xl relative overflow-hidden transition-all duration-200 min-w-[240px] sm:min-w-0 flex flex-col justify-between h-32 select-none border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/80 group`}
      id={`wallet-card-${wallet.id}`}
    >
      {/* Dynamic left color ribbon */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: wallet.color }}
      />

      {/* Top Section: Icon, Name and Actions */}
      <div className="flex items-start justify-between relative pl-1.5">
        <div className="flex items-center gap-2.5">
          <div className="text-slate-600 dark:text-slate-300 shrink-0">
            <IconRenderer name={wallet.icon} className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs tracking-tight text-slate-900 dark:text-slate-100">
              {wallet.name}
            </h4>
            <span className="text-[9px] text-slate-400 dark:text-slate-400 font-medium tracking-wide uppercase">
              Dompet Utama
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 no-print">
          <button 
            onClick={() => onEdit(wallet)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Edit"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button 
            onClick={() => onDelete(wallet.id)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
            title="Hapus"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Clean Balance Display */}
      <div className="pl-1.5">
        <span className="text-[9px] text-slate-400 dark:text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
          Saldo Saat Ini
        </span>
        <div className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-mono leading-none">
          {formatIDR(wallet.currentBalance ?? wallet.initialBalance)}
        </div>
      </div>
    </div>
  );
}
