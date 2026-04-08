import { useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayment';
import { useSession } from '@/hooks/useSessions';
import { Loader2, XCircle, CreditCard, Clock, CheckCircle2, History, Ban, Lock, RefreshCcw } from 'lucide-react';

declare const Razorpay: any;

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = Number(searchParams.get('sessionId'));

  const { data: session } = useSession(sessionId);
  const { saga, isLoading, startSaga, verifyPayment, error } = usePayment(sessionId);

  // Initialize Saga if needed
  useEffect(() => {
    if (session?.status === 'ACCEPTED' && (!saga || saga.status === 'INITIATED')) {
      startSaga({
        sessionId: session.id,
        mentorId: session.mentorId,
        learnerId: session.learnerId,
        durationMinutes: session.durationMinutes
      });
    }
  }, [session, saga, startSaga]);

  // Razorpay Bridge
  const openRazorpay = useCallback((saga: any) => {
    const options = {
      key: 'rzp_test_SWGUsISMJTk4IH',
      amount: saga.amount * 100,
      currency: 'INR',
      name: 'SkillSync',
      description: `Session #${saga.sessionId}`,
      order_id: saga.paymentReference,
      handler: (response: any) => {
        verifyPayment({
          sessionId: saga.sessionId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        });
      },
      prefill: { email: '' },
      theme: { color: '#4f46e5' }
    };
    new Razorpay(options).open();
  }, [verifyPayment]);

  const statusMap: Record<string, { icon: any; title: string; bg: string; color: string }> = {
    COMPLETED: { icon: <CheckCircle2 className="w-10 h-10" />, title: 'Payment Complete', bg: 'bg-emerald-500', color: 'text-emerald-600' },
    FAILED: { icon: <XCircle className="w-10 h-10" />, title: 'Payment Failed', bg: 'bg-red-500', color: 'text-red-600' },
    PAYMENT_PENDING: { icon: <CreditCard className="w-10 h-10" />, title: 'Complete Payment', bg: 'bg-indigo-600', color: 'text-indigo-600' },
    INITIATED: { icon: <Clock className="w-10 h-10" />, title: 'Preparing Checkout', bg: 'bg-amber-500', color: 'text-amber-600' },
    REJECTED: { icon: <Ban className="w-10 h-10" />, title: 'Session Declined', bg: 'bg-slate-500', color: 'text-slate-600' },
    REFUNDED: { icon: <History className="w-10 h-10" />, title: 'Refunded', bg: 'bg-violet-500', color: 'text-violet-600' },
  };

  const config = saga ? (statusMap[saga.status] || statusMap.FAILED) : statusMap.INITIATED;

  if (isLoading || (session?.status === 'ACCEPTED' && !saga)) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-6 text-slate-400">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Initializing Secure Channel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 lg:p-12 animate-fade-in font-sans">
      <div className="w-full max-w-lg space-y-8">
        {saga && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-drop-in">
            {/* Header */}
            <div className={`p-12 text-center text-white space-y-6 ${config.bg} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-[2.5rem] flex items-center justify-center border border-white/30 shadow-2xl relative z-10 backdrop-blur-md">
                {config.icon}
              </div>
              <div className="space-y-1 relative z-10">
                <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none">{config.title}</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Transactional Node Cluster</p>
              </div>
              <div className="pt-4 relative z-10">
                 <span className="bg-black/20 px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/10">
                    Phase Index: #{saga.sessionId}
                 </span>
              </div>
            </div>

            {/* Financial Content */}
            <div className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm font-black uppercase tracking-widest text-slate-400 pl-1">
                   <span>Unit Allocation</span>
                   <span className="text-slate-900">{saga.durationMinutes} Units</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black uppercase tracking-widest text-slate-400 pl-1">
                   <span>Domain Rate</span>
                   <span className="text-slate-900">₹{saga.hourlyRate}/Hr</span>
                </div>
                <div className="h-[1px] bg-slate-50"></div>
                <div className="flex items-center justify-between">
                   <p className="text-xs font-black text-slate-900 uppercase tracking-tighter italic">Total Equity Required</p>
                   <p className="text-4xl font-black text-primary-600 tracking-tighter">₹{saga.amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Status Banners */}
              {saga.status === 'COMPLETED' && (
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-4 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Protocol success. Session node confirmed.</p>
                </div>
              )}
              {(saga.status === 'FAILED' || saga.status === 'COMPENSATION_FAILED') && (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center gap-4 text-red-700">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{saga.failureReason || 'Initialization failure. Try fresh cycle.'}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-4">
                {saga.status === 'PAYMENT_PENDING' && saga.paymentReference && (
                  <button 
                    onClick={() => openRazorpay(saga)}
                    className="w-full h-18 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all py-5"
                  >
                    <CreditCard className="w-6 h-6" /> Initialize Authorization
                  </button>
                )}
                
                {saga.status === 'FAILED' && (
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full h-18 bg-red-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 active:scale-95 transition-all py-5"
                  >
                    <RefreshCcw className="w-6 h-6" /> Reboot Cycle
                  </button>
                )}

                <button 
                  onClick={() => navigate('/sessions')}
                  className="w-full h-14 bg-white border-2 border-slate-100 text-slate-400 rounded-[1.2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:border-primary-100 hover:text-primary-600 transition-all py-4 text-[10px]"
                >
                  Registry Archive
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Security */}
        <div className="flex items-center justify-center gap-3 text-slate-300 font-extrabold text-[10px] uppercase tracking-widest">
          <Lock className="w-3.5 h-3.5" />
          Secured by Razorpay · 256-bit SSL Operational Interface
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-500 font-black text-[9px] uppercase tracking-widest">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
