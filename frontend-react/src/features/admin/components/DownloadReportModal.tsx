import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Download, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({ 
  isOpen, 
  onClose,
  userId,
  userName 
}) => {
  const [format, setFormat] = useState<'PDF' | 'IMAGE' | null>(null);
  const [imgType, setImgType] = useState<'JPG' | 'PNG' | 'JPEG'>('PNG');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const backendFormat = format === 'PDF' ? 'PDF' : 'IMAGE';
      const response = await fetch(`/api/user/admin/users/${userId}/report?format=${backendFormat}&imgType=${imgType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'PDF' 
        ? `mentor_${userName.toLowerCase().replace(/\s+/g, '_')}_report.pdf`
        : `mentor_${userName.toLowerCase().replace(/\s+/g, '_')}_profile.${imgType.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Download Report</h3>
            <p className="text-sm font-medium text-slate-400">Generate a snapshot for {userName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <Icon icon={X} size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Format</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFormat('PDF')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  format === 'PDF' 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${format === 'PDF' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  <Icon icon={FileText} size={24} />
                </div>
                <span className={`text-xs font-black ${format === 'PDF' ? 'text-indigo-600' : 'text-slate-600'}`}>PDF Document</span>
              </button>

              <button 
                onClick={() => setFormat('IMAGE')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  format === 'IMAGE' 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${format === 'IMAGE' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  <Icon icon={ImageIcon} size={24} />
                </div>
                <span className={`text-xs font-black ${format === 'IMAGE' ? 'text-indigo-600' : 'text-slate-600'}`}>Image File</span>
              </button>
            </div>
          </div>

          {format === 'IMAGE' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extension</label>
              <div className="flex gap-2">
                {(['JPG', 'PNG', 'JPEG'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setImgType(type)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                      imgType === type 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <Button variant="ghost" className="flex-1 rounded-2xl" onClick={onClose} disabled={isDownloading}>
            Cancel
          </Button>
          <Button 
            className="flex-1 rounded-2xl gap-2 font-black tracking-widest uppercase text-[11px] shadow-xl shadow-indigo-100 disabled:opacity-50" 
            onClick={handleDownload}
            disabled={isDownloading || !format}
          >
            {isDownloading ? 'Generating...' : <><Icon icon={Download} size={14} /> Download</>}
          </Button>
        </div>
      </div>
    </div>
  );
};
