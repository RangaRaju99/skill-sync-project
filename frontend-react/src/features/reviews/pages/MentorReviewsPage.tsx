import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReviews } from '@/hooks/useReviews';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ArrowLeft, Star, MessageSquare, Send, Trash2, Edit2, ShieldCheck, User } from 'lucide-react';

export default function MentorReviewsPage() {
  const { mentorId: mId } = useParams();
  const navigate = useNavigate();
  const mentorId = Number(mId);

  const { user } = useAuthStore();
  const { reviews, rating, isLoading, submitReview } = useReviews(mentorId);
  
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [newReview, setNewReview] = useState({ sessionId: 0, rating: 0, comment: '' });

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.sessionId || !newReview.rating || !newReview.comment) return;
    setSubmitting(true);
    try {
      await submitReview({
        sessionId: newReview.sessionId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      setNewReview({ sessionId: 0, rating: 0, comment: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Feedback Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-12 animate-fade-in font-sans mt-4 text-left">
      <button 
        onClick={() => navigate(`/mentors/${mentorId}`)}
        className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-black text-xs uppercase tracking-[0.2em] transition-all mb-12 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Expert Profile
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight uppercase italic">
            Experience <span className="text-primary-600">Sync</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">Verified reviews and performance metrics.</p>
        </div>
        {rating && (
          <div className="bg-amber-50 rounded-[2rem] p-8 flex items-center gap-6 border border-amber-100 shadow-xl shadow-amber-600/5">
            <div className="text-4xl font-black text-amber-600">{rating.averageRating.toFixed(1)}</div>
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`} />
                ))}
              </div>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{rating.totalReviews} Verification Nodes</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Form */}
        {!user?.roles.includes('ROLE_MENTOR') && (
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl animate-drop-in space-y-10">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Deploy New Review</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Share your operational experience</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session ID Cluster</label>
                  <input 
                    type="number"
                    value={newReview.sessionId || ''}
                    onChange={e => setNewReview(p => ({ ...p, sessionId: Number(e.target.value) }))}
                    placeholder="Enter target ID..."
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quality Metric</label>
                  <div className="flex items-center gap-4 h-16">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => setHoverRating(i)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewReview(p => ({ ...p, rating: i }))}
                          className="p-1 transition-transform hover:scale-125"
                        >
                          <Star className={`w-8 h-8 ${i <= (hoverRating || newReview.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest italic pl-2">
                      {ratingLabels[hoverRating || newReview.rating]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contextual Commentary</label>
                <textarea 
                  value={newReview.comment}
                  onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))}
                  rows={4}
                  placeholder="Describe the knowledge transfer efficiency..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-8 outline-none focus:border-primary-600 focus:bg-white transition-all font-bold text-slate-900 resize-none leading-relaxed"
                />
              </div>

              <button 
                disabled={submitting || !newReview.sessionId || !newReview.rating || !newReview.comment}
                className="w-full h-18 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                Initialize Submission
              </button>
            </form>
          </div>
        )}

        {/* List */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-4">
             <MessageSquare className="w-6 h-6 text-primary-600" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Historical Archives</h3>
          </div>

          <div className="grid gap-6">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary-600">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {user?.id === String(r.learnerId) && (
                    <div className="flex gap-2">
                       <button className="p-2 text-slate-200 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                       <button className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <p className="text-slate-600 font-bold leading-relaxed italic border-l-4 border-primary-50 pl-6 h-auto overflow-hidden">
                  "{r.comment}"
                </p>
                <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-primary-400 uppercase tracking-widest">
                   <ShieldCheck className="w-3 h-3" />
                   Verified Interaction Phase
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="py-20 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100">
                   <MessageSquare className="w-10 h-10" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Zero Testimonials</h3>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No historical data identified for this node</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
