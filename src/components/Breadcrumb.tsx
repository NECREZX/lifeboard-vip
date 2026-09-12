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
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center flex-wrap gap-1.5 text-xs font-semibold py-0.5 w-fit max-w-full ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mx-0.5" />
            )}

            {isLast ? (
              <span className="text-slate-900 dark:text-slate-100 font-bold tracking-tight truncate max-w-[200px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 transition-colors cursor-pointer hover:underline underline-offset-2 active:scale-95"
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
