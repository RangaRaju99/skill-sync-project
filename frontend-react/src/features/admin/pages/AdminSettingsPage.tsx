import React, { useState } from 'react';
import { Settings, Mail, Bell, Shield, CheckCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';

/**
 * Premium SaaS Toggle Component with Auto-Save Flow
 */
interface SaaSToggleProps {
  label: string;
  description: string;
  initialState: boolean;
  locked?: boolean;
}

const SaaSToggle: React.FC<SaaSToggleProps> = ({ label, description, initialState, locked = false }) => {
  const [isOn, setIsOn] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { showToast } = useToast();

  const handleToggle = async () => {
    if (locked || isSaving) return;
    
    // Optimistic UI updates
    const newState = !isOn;
    setIsOn(newState);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsSaving(false);
      setSaveSuccess(true);
      showToast(`${label} updated successfully`, 'success');
      
      // Hide success indicator after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setIsOn(!newState); // Revert on failure
      setIsSaving(false);
      showToast(`Failed to update ${label}`, 'error');
    }
  };

  return (
    <div className={`p-6 bg-white border border-slate-100 rounded-[2rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)] hover:border-slate-200 flex items-center justify-between group ${locked ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex-1 pr-8">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-sm font-black text-slate-900 tracking-tight">{label}</p>
          {locked && <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1"><Icon icon={Lock} size={10} /> Pro Plan</span>}
        </div>
        <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-lg">{description}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0 relative">
        {/* State Indicators */}
        <div className="absolute -left-10 flex items-center justify-center">
            {isSaving && <Icon icon={Loader2} size={16} className="text-slate-400 animate-spin" />}
            {saveSuccess && <Icon icon={CheckCircle} size={16} className="text-emerald-500 animate-fade-in" />}
        </div>
        
        {/* Toggle Track */}
        <button 
          onClick={handleToggle}
          disabled={locked || isSaving}
          className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative outline-none focus:ring-4 focus:ring-indigo-100 ${
            isOn 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
              : 'bg-slate-200'
          }`}
        >
          {/* Toggle Knob */}
          <div 
            className={`w-6 h-6 bg-white rounded-full transition-all duration-300 transform shadow-sm ${
              isOn ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('General');

  // Sidebar Configuration mapping
  const navItems = [
    { id: 'General', label: 'General', icon: <Icon icon={Settings} size={18} /> },
    { id: 'Email', label: 'Email', icon: <Icon icon={Mail} size={18} /> },
    { id: 'Notifications', label: 'Notifications', icon: <Icon icon={Bell} size={18} /> },
    { id: 'Security', label: 'Security', icon: <Icon icon={ShieldCheck} size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Settings</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure global platform parameters instantly.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Save Active</span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
         {/* Left Panel: Navigation */}
         <div className="w-full lg:w-72 space-y-2 sticky top-[120px]">
            {navItems.map((item) => (
               <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${
                     activeTab === item.id 
                        ? 'bg-indigo-50 text-indigo-600 shadow-[inset_4px_0_0_0_rgb(79,70,229)]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
               >
                  {item.icon} {item.label}
               </button>
            ))}
         </div>

         {/* Right Panel: Dynamic Content Forms */}
         <div className="flex-1 max-w-4xl space-y-8 animate-fade-in">
            {activeTab === 'General' && (
               <>
                  <div className="space-y-4">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2 mb-2">Platform Features</h3>
                     <SaaSToggle label="Auto Approve Mentors" description="Automatically approve incoming mentor applications without requiring manual administrative review." initialState={false} />
                     <SaaSToggle label="Audit Logging" description="Record all critical administrative actions and payload data to the persistent database history." initialState={true} />
                     <SaaSToggle label="Allow Group Creation" description="Enable standard users to spawn new decentralized learning hubs across the platform." initialState={true} />
                  </div>
                  <div className="space-y-4 mt-8 pt-8 border-t border-slate-100">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2 mb-2">Metadata Configuration</h3>
                      <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-6">
                         <Input label="Platform Name" defaultValue="SkillSync Core" />
                         <Input label="Administrative Contact" type="email" defaultValue="admin@skillsync.com" />
                      </div>
                  </div>
               </>
            )}

            {activeTab === 'Email' && (
               <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2 mb-2">Communication Protocols</h3>
                  <SaaSToggle label="Send Email on Block User" description="Dispatch an automated transparency email to targets when their global node access is isolated." initialState={true} />
                  <SaaSToggle label="Send Email on Role Change" description="Notify users immediately whenever authorization levels change (e.g., promoted to Mentor)." initialState={true} />
                  <SaaSToggle label="Weekly Growth Reports" description="Compile and email a weekly digest summarizing new users, hubs, and total learning hours." initialState={false} />
               </div>
            )}

            {activeTab === 'Notifications' && (
               <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2 mb-2">Internal Alerts</h3>
                  <SaaSToggle label="Admin Alerts" description="Ping the primary dashboard when highly critical system events occur." initialState={true} />
                  <SaaSToggle label="User Report Alerts" description="Receive immediate visual alerts when a user or group receives a moderation flag." initialState={true} />
                  <SaaSToggle label="System Alerts" description="Warnings about backend resource limits and network connection status." initialState={false} />
               </div>
            )}

            {activeTab === 'Security' && (
               <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2 mb-2">Defense Matrix</h3>
                  <SaaSToggle label="Enable 2FA (Administrators)" description="Mandate cryptographic two-factor authentication for all platform identities with Root Access." initialState={true} />
                  <SaaSToggle label="Allow Multiple Devices" description="Permit global users to authenticate concurrently from mobile and desktop vectors." initialState={false} />
                  <SaaSToggle label="Advanced Threat Protection" description="Utilize enterprise IP-tracking and anomaly detection to shadowban suspicious botnets." initialState={false} locked={true} />

                  <div className="mt-8 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                      <Input label="Idle Session Timeout (Minutes)" type="number" defaultValue={30} containerClassName="max-w-[200px]" />
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-xl mt-4 italic opacity-70 px-1">Automatically disconnect user sockets and enforce re-authentication if completely idle.</p>
                   </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
