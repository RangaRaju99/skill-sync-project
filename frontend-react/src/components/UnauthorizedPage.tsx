import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-8">
      <div className="w-24 h-24 bg-destructive/10 rounded-[32px] flex items-center justify-center p-6 border border-destructive/20 animate-pulse">
        <ShieldAlert className="w-full h-full text-destructive" />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Access Denied</h1>
        <p className="text-foreground/50 font-medium max-w-md">You don't have the necessary permissions to view this section of SkillSync.</p>
      </div>

      <Link 
        to="/" 
        className="flex items-center space-x-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Safety</span>
      </Link>
    </div>
  );
}
