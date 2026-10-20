/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  contrastColor?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '', contrastColor }) => {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center flex-wrap gap-1.5 text-xs font-semibold py-1 w-fit max-w-full leading-normal ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight 
                className={`w-3.5 h-3.5 shrink-0 mx-0.5 ${contrastColor ? 'opacity-60' : 'text-slate-400 dark:text-slate-500'}`} 
                style={contrastColor ? { color: contrastColor } : undefined}
              />
            )}

            {isLast ? (
              <span 
                className={`font-bold tracking-tight truncate max-w-[220px] sm:max-w-md py-0.5 pb-1 leading-normal inline-block ${
                  contrastColor ? 'opacity-100 drop-shadow-xs' : 'text-slate-900 dark:text-slate-100'
                }`}
                style={contrastColor ? { color: contrastColor } : undefined}
              >
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className={`cursor-pointer hover:underline underline-offset-2 py-0.5 pb-1 leading-normal inline-block ${
                  contrastColor ? 'opacity-85 hover:opacity-100' : 'text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300'
                }`}
                style={contrastColor ? { color: contrastColor } : undefined}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
