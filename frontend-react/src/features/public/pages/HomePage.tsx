import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useEffect } from 'react';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const categories = [
    { name: 'Frontend', icon: 'code' },
    { name: 'Backend', icon: 'storage' },
    { name: 'Design', icon: 'palette' },
    { name: 'Marketing', icon: 'insights' },
    { name: 'Mobile', icon: 'smartphone' },
    { name: 'AI / ML', icon: 'psychology' },
    { name: 'Business', icon: 'business_center' },
    { name: 'Writing', icon: 'edit_note' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/mentors');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary-100 selection:text-primary-900">
      
      {/* Premium Nav (Guest) */}
      <nav className="sticky top-0 z-[100] glass-effect h-20 px-6 lg:px-10 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
            <span className="material-icons text-white">auto_awesome</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">SkillSync</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/auth/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors px-4 py-2">Sign In</Link>
          <Link to="/auth/register" className="bg-primary-600 text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all active:scale-95">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary-400/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-violet-400/5 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 mb-8 animate-drop-in">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Expert Learning Platform</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
            Unlock your Potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">Expert Mentorship</span>
          </h1>
          
          <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with industry-leading experts for personalized coaching, session bookings, and career growth. Join thousands of learners accelerating their careers today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/auth/register" className="w-full sm:w-auto bg-primary-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-primary-200 hover:bg-primary-700 transition-all hover-lift active:scale-95">
              Explore Best Mentors
            </Link>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?u=1" className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
                <img src="https://i.pravatar.cc/100?u=2" className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
                <img src="https://i.pravatar.cc/100?u=3" className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
              </div>
              <span>Trusted by 10k+ learners</span>
            </div>
          </div>
        </div>

        {/* Featured Categories Grid (Mobile First) */}
        <div className="max-w-7xl mx-auto px-6 mt-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 animate-fade-in">
            {categories.map((cat) => (
              <div key={cat.name} className="glass-card p-6 flex flex-col items-center justify-center gap-4 group hover:bg-white transition-all hover:scale-105 border-white/50">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:bg-primary-50 transition-colors">
                  <span className="material-icons-outlined text-slate-400 group-hover:text-primary-600 transition-colors">{cat.icon}</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Split Layout */}
      <section className="bg-white py-32 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            <div className="space-y-10">
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 leading-tight">Everything you need to <br/> <span className="text-primary-600">succeed professionally</span></h2>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-violet-600">video_call</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">Live 1:1 Sessions</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">Schedule high-impact video calls directly with experts in your field.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-emerald-600">payments</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">Secure Payments</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">Transparent, secure transactions with Razorpay integration and automated payouts.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-orange-600">stars</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">Monetize Expertise</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">Are you an expert? Apply to become a mentor and earn by sharing your wisdom.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link to="/auth/register" className="inline-flex items-center gap-2 group text-primary-600 font-bold tracking-wide uppercase text-sm">
                  Find your domain 
                  <span className="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-primary-100/50 rounded-[40px] blur-2xl"></div>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                   className="relative rounded-[32px] shadow-2xl border-4 border-white"
                   alt="Learning together" />
              
              {/* Floating UI Elements */}
              <div className="absolute -bottom-10 -left-10 glass-card p-6 border-white animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="material-icons text-white">check</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth</p>
                    <p className="text-sm font-bold text-slate-800">+85% Skill Match</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer (Premium) */}
      <footer className="bg-slate-900 py-20 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 border-b border-white/10 pb-16">
          <div className="space-y-6 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white">auto_awesome</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">SkillSync</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leading the next generation of online learning through human-to-human connection.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">Platform</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-400">
                <a href="#" className="hover:text-primary-400 transition-colors">Mentors</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Skills</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Pricing</a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">Company</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-400">
                <a href="#" className="hover:text-primary-400 transition-colors">About</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Careers</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Support</a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">Legal</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-400">
                <a href="#" className="hover:text-primary-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Terms</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-slate-500">© 2026 SkillSync Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-slate-400 hover:text-white transition-colors cursor-pointer material-icons text-xl">facebook</span>
            <span className="text-slate-400 hover:text-white transition-colors cursor-pointer material-icons text-xl">camera_alt</span>
            <span className="text-slate-400 hover:text-white transition-colors cursor-pointer material-icons text-xl">share</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
