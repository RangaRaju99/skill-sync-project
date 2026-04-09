import React from 'react';

interface Column {
  header: string;
  accessor: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  selectedIds?: number[];
  onSelectChange?: (ids: number[]) => void;
  isLoading?: boolean;
}

export const DataTable: React.FC<TableProps> = ({ columns, data, selectedIds = [], onSelectChange, isLoading }) => {
  const toggleAll = () => {
    if (selectedIds.length === data.length) onSelectChange?.([]);
    else onSelectChange?.(data.map(d => d.userId || d.groupId || d.id));
  };

  const toggleOne = (id: number) => {
    if (selectedIds.includes(id)) onSelectChange?.(selectedIds.filter(i => i !== id));
    else onSelectChange?.([...selectedIds, id]);
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4 p-8">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-50">
            {onSelectChange && (
              <th className="p-6 text-left w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col, i) => (
              <th key={i} className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row, i) => (
            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
              {onSelectChange && (
                <td className="p-6">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedIds.includes(row.userId || row.groupId || row.id)}
                    onChange={() => toggleOne(row.userId || row.groupId || row.id)}
                  />
                </td>
              )}
              {columns.map((col, j) => (
                <td key={j} className="p-6 text-sm font-bold text-slate-700">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
