import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useMentor } from '@/hooks/useMentors';
import { useSkills, groupSkillsByCategory } from '@/hooks/useSkills';
import { Loader2, ArrowLeft, Lightbulb, Calendar, Clock, ShieldCheck, Send } from 'lucide-react';

export default function RequestSessionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mentorId = Number(searchParams.get('mentorId'));

  const { data: mentor, isLoading: isMentorLoading } = useMentor(mentorId);
  const { data: skillsData } = useSkills();
  const { requestSession, isLoading: isRequesting } = useSessions();

  const [formData, setFormData] = useState({
    skillId: 0,
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: 60
  });

  const durations = [
    { label: '30m', value: 30, sub: '₹ × 0.5' },
    { label: '60m', value: 60, sub: '₹ × 1.0' },
    { label: '90m', value: 90, sub: '₹ × 1.5' },
    { label: '2hr', value: 120, sub: '₹ × 2.0' },
  ];

  const groupedSkills = useMemo(() => skillsData ? groupSkillsByCategory(skillsData) : [], [skillsData]);
  const estimatedCost = mentor ? (mentor.hourlyRate / 60) * formData.durationMinutes : 0;
  const isFormValid = formData.skillId > 0 && formData.scheduledDate && formData.scheduledTime && formData.durationMinutes > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      // Create a date object using local time components to match the UI
      const [year, month, day] = formData.scheduledDate.split('-').map(Number);
      const [hour, minute] = formData.scheduledTime.split(':').map(Number);
      const localDate = new Date(year, month - 1, day, hour, minute);
      const scheduledAt = localDate.toISOString();

      if (!mentor || !mentor.userId) {
        throw new Error('Mentor profile is incomplete or missing.');
      }
      await requestSession({
        mentorId: mentor.userId, // Use userId to sync with mentor dashboard headers
        skillId: formData.skillId,
        scheduledAt,
        durationMinutes: formData.durationMinutes
      });
      navigate('/sessions');
    } catch (err: any) {
      console.error('Session request failed:', err);
      const msg = err.response?.data?.message || 'A conflict occurred. This slot might already be booked.';
      alert(msg);
    }
  };

  if (isMentorLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Configuring Session Link...</p>
      </div>
    );
  }

  const initials = mentor?.specialization.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'M';

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-12 animate-fade-in font-sans mt-4 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest hover:text-primary-700 transition-all mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Book <span className="text-primary-600 italic">Expert</span> Session
          </h1>
          <p className="text-slate-500 font-bold text-lg max-w-md">Initialize your knowledge transfer with precise parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Mentor Panel */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          {mentor && (
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl space-y-10 animate-drop-in overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
               
               <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.2rem] p-1 shadow-2xl shadow-primary-200">
                    <div className="w-full h-full bg-white rounded-[2rem] flex items-center justify-center">
                       <span className="text-3xl font-black text-primary-600">{initials}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">{mentor.specialization}</h3>
                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mt-2 italic opacity-60">Verified Domain Expert</p>
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-slate-50 relative z-10 font-black uppercase tracking-widest text-[9px]">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <span className="text-slate-400">Unit Rate</span>
                     <span className="text-slate-900 text-sm">₹{mentor.hourlyRate}/Hr</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <span className="text-slate-400">Duration</span>
                     <span className="text-slate-900 text-sm">{formData.durationMinutes} Minutes</span>
                  </div>
                  <div className="pt-6 flex justify-between items-center border-t border-slate-100/50">
                     <span className="text-slate-900 text-[10px] italic">Universal Estimate</span>
                     <span className="text-3xl font-black text-primary-600 tracking-tighter">₹{Math.round(estimatedCost)}</span>
                  </div>
               </div>

               <div className="p-5 bg-emerald-50/50 rounded-2xl flex items-center gap-4 border border-emerald-100 relative z-10">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-relaxed">
                    Escrow Protection: Tokens allocated only upon successful acceptance.
                  </p>
               </div>
             </div>
          )}
        </div>

        {/* Configuration Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm animate-drop-in">
            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Domain Vector */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <Lightbulb className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Domain Vector</h3>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Expertise</label>
                  <div className="relative group">
                    <span className="material-icons absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors">auto_stories</span>
                    <select 
                      value={formData.skillId}
                      onChange={e => setFormData(p => ({ ...p, skillId: Number(e.target.value) }))}
                      className="w-full h-18 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-16 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value={0} disabled>Identify target node...</option>
                      {groupedSkills.map(cat => (
                        <optgroup key={cat.category} label={cat.category.toUpperCase()}>
                          {cat.skills.map(s => (
                            <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Temporal Coordinates */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <Calendar className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Temporal Coordinates</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Universal Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.scheduledDate}
                        onChange={e => setFormData(p => ({ ...p, scheduledDate: e.target.value }))}
                        className="w-full h-18 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-16 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900 cursor-pointer" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phase Start (Local)</label>
                    <div className="relative group">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                      <input 
                        type="time" 
                        value={formData.scheduledTime}
                        onChange={e => setFormData(p => ({ ...p, scheduledTime: e.target.value }))}
                        className="w-full h-18 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-16 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900 cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Span Allocation */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <Clock className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Span Allocation</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {durations.map(d => (
                    <button 
                      key={d.value}
                      type="button" 
                      onClick={() => setFormData(p => ({ ...p, durationMinutes: d.value }))}
                      className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-500 active:scale-95 space-y-1.5 group ${formData.durationMinutes === d.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                    >
                      <span className="text-lg font-black uppercase italic">{d.label}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest opacity-60 ${formData.durationMinutes === d.value ? 'text-indigo-100' : ''}`}>{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-4 text-slate-400 font-black uppercase tracking-[0.1em] text-[9px] max-w-[240px] leading-relaxed">
                    <span className="material-icons text-slate-300">info</span>
                    Protocol: Expert response required within 24 standard hours.
                 </div>
                 
                 <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      type="button" 
                      onClick={() => navigate(-1)} 
                      className="flex-1 md:flex-none px-10 h-16 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-all"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit" 
                      disabled={!isFormValid || isRequesting}
                      className="flex-1 md:flex-none h-18 bg-primary-600 text-white rounded-[1.5rem] px-12 font-black uppercase tracking-[0.2rem] shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed py-6"
                    >
                       {isRequesting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-5 h-5" />}
                       Synchronize
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
