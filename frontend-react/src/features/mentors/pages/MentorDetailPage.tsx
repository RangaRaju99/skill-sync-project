import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useMentor } from '@/hooks/useMentors';
import { useReviews } from '@/hooks/useReviews';
import { Loader2, Star, Users, Calendar, MessageCircle, ShieldCheck, Mail, GraduationCap } from 'lucide-react';

export default function MentorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const mentorId = Number(id);

  const { data: mentor, isLoading: isMentorLoading } = useMentor(mentorId);
  const { reviews, rating } = useReviews(mentorId);

  if (isMentorLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Assembling Profile Matrix...</p>
      </div>
    );
  }

  if (!mentor) return <div className="p-20 text-center font-bold">Expert not found in our records.</div>;

  const isOwnProfile = Number(user?.id) === Number(mentor.userId);

  const statusClasses = (status: string) => {
    const map: Record<string, any> = {
      'AVAILABLE': { bg: 'bg-emerald-500 shadow-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
      'BUSY': { bg: 'bg-amber-500 shadow-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
      'UNAVAILABLE': { bg: 'bg-slate-300', text: 'text-slate-400', dot: 'bg-slate-300' }
    };
    return map[status] || map['UNAVAILABLE'];
  };

  const status = mentor.isApproved ? 'AVAILABLE' : 'UNAVAILABLE'; // Simplified for demo
  const classes = statusClasses(status);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-12 animate-fade-in font-sans mt-4 text-left">
      <button 
        onClick={() => navigate('/mentors')}
        className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-bold text-xs uppercase tracking-widest transition-all mb-10 group"
      >
        <span className="material-icons text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back to Expert Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Profile Card Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl flex flex-col items-center text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
            
            <div className="relative z-10 group">
              <div className="w-40 h-40 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[3rem] p-1.5 shadow-2xl shadow-primary-200">
                <div className="w-full h-full bg-white rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                  {mentor.avatar ? (
                    <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-primary-600 group-hover:scale-110 transition-transform">{mentor.name?.[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-50">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Certified</span>
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{mentor.name}</h2>
              <p className="text-sm font-black text-primary-600 uppercase tracking-[0.2em]">{mentor.specialization}</p>
              
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {rating?.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                  <Users className="w-3.5 h-3.5" />
                  {rating?.totalReviews || 0} Reviews
                </div>
              </div>
            </div>

            <div className="w-full py-8 px-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative z-10">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Hourly Rate</p>
               <p className="text-4xl font-black text-slate-900 tracking-tight">₹{mentor.hourlyRate}<span className="text-sm font-bold text-slate-400 ml-1">/hr</span></p>
            </div>

            <div className="w-full space-y-4 relative z-10">
              {isOwnProfile ? (
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <span className="material-icons">tune</span> Manage Dashboard
                </button>
              ) : (
                <>
                  <button 
                    disabled={status !== 'AVAILABLE'}
                    onClick={() => navigate(`/sessions/request?mentorId=${mentor.userId}`)}
                    className="w-full h-16 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar className="w-5 h-5" /> Book Session
                  </button>
                  <button className="w-full h-16 bg-white border-2 border-slate-100 text-slate-700 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95">
                    <MessageCircle className="w-5 h-5" /> Send DM
                  </button>
                </>
              )}
            </div>

            <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] relative z-10 ${classes.text}`}>
               <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${classes.dot}`}></div>
               {status}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-8 space-y-12">
          {/* Bio Section */}
          <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-8 animate-drop-in">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
              <GraduationCap className="w-6 h-6 text-primary-600" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Professional Narrative</h3>
            </div>
            
            <p className="text-slate-600 leading-relaxed font-medium text-xl whitespace-pre-line">
              {mentor.bio || 'This expert is still crafting their professional story. Check back soon for a deep dive into <i>their methodology</i> and path to excellence.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="bg-primary-50/50 p-8 rounded-[2rem] border border-primary-100/50 group hover:bg-primary-50 transition-colors">
                <h5 className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-2">Practical Experience</h5>
                <p className="text-2xl font-black text-primary-700 tracking-tight">{mentor.yearsOfExperience}+ Years Mastery</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:bg-slate-100 transition-colors">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Link</h5>
                <div className="flex items-center gap-2 text-xl font-black text-slate-800 tracking-tight">
                  <Mail className="w-5 h-5 text-slate-400" />
                  Primary Channel
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <MessageCircle className="w-6 h-6 text-primary-600" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Community Feedback</h3>
              </div>
              {rating && (
                <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-2xl shadow-xl shadow-amber-50 border border-amber-100">
                  <Star className="w-5 h-5 text-amber-500 fill-current" />
                  <span className="text-lg font-black text-slate-800">{rating.averageRating.toFixed(1)}</span>
                  <span className="text-xs font-bold text-slate-300">/ 5.0</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-primary-600/5 transition-all duration-500 group">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex gap-5">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-black text-xl group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          {r.username?.[0].toUpperCase() || 'L'}
                        </div>
                        <div className="space-y-2">
                          <div className="flex gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-4 h-4 ${star <= r.rating ? 'fill-current' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.username || 'System Learner'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest pt-2">{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-slate-600 font-medium text-lg leading-relaxed italic border-l-4 border-slate-50 pl-6 group-hover:border-primary-100 transition-colors">
                      "{r.comment || 'This learner had a productive session but opted not to leave a detailed comment.'}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 italic">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm">
                    <span className="material-icons text-4xl">rate_review</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-slate-800 font-black text-xl tracking-tight">No sessions logged yet</h4>
                    <p className="text-slate-400 font-bold text-sm tracking-wide">Be the first to embark on a journey with this expert!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
