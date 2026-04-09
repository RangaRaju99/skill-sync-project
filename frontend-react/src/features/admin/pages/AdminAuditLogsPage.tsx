import React, { useState, useMemo } from 'react';
import { Database, Filter, Download, Activity, FileSpreadsheet, Search } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { DataTable } from '../components/DataTable';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function AdminAuditLogsPage() {
  const { activity, isActivityLoading } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  // Intelligent filtering based on action type or search string
  const filteredActivity = useMemo(() => {
    return activity.filter((log: any) => {
      const matchesSearch = log.target?.toLowerCase().includes(search.toLowerCase()) || 
                            log.description?.toLowerCase().includes(search.toLowerCase());
      const matchesAction = filterAction === 'ALL' || log.action?.includes(filterAction);
      return matchesSearch && matchesAction;
    });
  }, [activity, search, filterAction]);

  const exportCSV = () => {
    if (filteredActivity.length === 0) return;
    const headers = ['Action,Target,Admin,Time,Description'];
    const csvData = filteredActivity.map((log: any) => 
      `"${log.action}","${log.target || 'N/A'}","${log.admin || log.performerEmail}","${new Date(log.timestamp).toLocaleString()}","${log.description}"`
    );
    const blob = new Blob([[...headers, ...csvData].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'audit_logs_expert.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
     { header: 'Action', accessor: 'action', render: (row: any) => (
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Icon icon={Activity} size={14} />
           </div>
           <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{row.action}</span>
        </div>
     )},
    { header: 'Target ID', accessor: 'target', render: (row: any) => <span className="font-bold text-slate-700">{row.target || 'System'}</span> },
    { header: 'Context Parameter', accessor: 'description', render: (row: any) => <span className="text-slate-500 font-bold text-xs">{row.description}</span> },
    { header: 'Executor', accessor: 'admin', render: (row: any) => <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg">{row.admin || row.performerEmail}</span> },
    { header: 'Timestamp', accessor: 'timestamp', render: (row: any) => <span className="text-slate-400 font-bold text-xs">{new Date(row.timestamp).toLocaleString()}</span> }
  ];

  return (
    <div className="space-y-8 pb-32 h-full flex flex-col">
      {/* Dynamic Header Component */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Audit Logs</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Irrefutable history of system modifications.</p>
        </div>
         <div className="flex gap-3">
            <Button onClick={exportCSV} leftIcon={<Icon icon={Download} size={16}/>}>
               Export CSV
            </Button>
         </div>
      </div>
      
      {/* Filtering Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative z-10 w-full mb-8">
          <Input 
             placeholder="Search targets, reasons..." 
             leftIcon={<Icon icon={Search} size={18} />}
             value={search}
             onChange={e => setSearch(e.target.value)}
             containerClassName="flex-1"
          />
         <select 
            value={filterAction} 
            onChange={e => setFilterAction(e.target.value)}
            className="bg-slate-50 border-none rounded-2xl py-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
         >
            <option value="ALL">All Actions</option>
            <option value="Block">Isolations</option>
            <option value="Role">Elevations</option>
            <option value="Group">Moderation</option>
         </select>
      </div>

      {/* Primary Data Interface */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[500px]">
         {isActivityLoading ? (
            <div className="p-12 space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl"></div>)}
            </div>
         ) : filteredActivity.length > 0 ? (
            <DataTable columns={columns} data={filteredActivity} />
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 animate-fade-in my-auto">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 shadow-inner mb-8">
                   <Icon icon={Database} size={40} />
                </div>
               <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">No Immutable Records</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm text-center leading-relaxed">
                  The registry is completely empty. Records automatically populate when administrative actions like Isolating nodes or Elevating roles occur. 
               </p>
            </div>
         )}
      </div>
    </div>
  );
}
