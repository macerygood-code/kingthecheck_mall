'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// ────────────────────────────────────
// 컬럼 정의 타입
// ────────────────────────────────────
export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

// ────────────────────────────────────
// DataTable 공통 컴포넌트
// ────────────────────────────────────
export default function DataTable<T extends { id?: string | number }>({
  columns, data, loading = false, emptyMessage = '데이터가 없습니다',
  onRowClick, sortKey, sortDir, onSort,
}: DataTableProps<T>) {

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{ width: col.width }}
                className={`px-4 py-3 text-left text-xs font-bold text-[#666] whitespace-nowrap ${onSort ? 'cursor-pointer select-none hover:text-primary' : ''}`}
                onClick={() => onSort && onSort(String(col.key))}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {onSort && sortKey === String(col.key) && (
                    sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-[#999] text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-50 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-[#F0F5FF] transition-colors' : 'hover:bg-gray-50/50'}`}
              >
                {columns.map((col) => {
                  const val = col.key.toString().includes('.')
                    ? col.key.toString().split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], row)
                    : (row as Record<string, unknown>)[col.key as string];

                  return (
                    <td key={String(col.key)} className="px-4 py-3 text-[#333] align-middle">
                      {col.render ? col.render(val, row) : String(val ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
