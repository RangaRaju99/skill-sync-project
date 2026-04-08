import { Settings as SettingsIcon, Bell, Shield, Eye, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div className="space-y-2 pb-6 border-b border-white/5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
        <p className="text-foreground/50 text-sm font-medium uppercase tracking-wider">Customize your account and experience</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {[
          { icon: SettingsIcon, title: 'General Preferences', desc: 'Manage your name, email, and basic account details.' },
          { icon: Bell, title: 'Notification Settings', desc: 'Choose what updates you want to receive.' },
          { icon: Eye, title: 'Privacy & Visibility', desc: 'Control who can see your profile and activity.' },
          { icon: Shield, title: 'Security & Access', desc: 'Change password and manage connected devices.' },
          { icon: Palette, title: 'Theme & Appearance', desc: 'Customize the look and feel of your dashboard.' },
        ].map((item) => (
          <div key={item.title} className="glass-card p-8 rounded-[32px] flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-3.5 group-hover:bg-primary/10 transition-colors">
                <item.icon className="w-full h-full text-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-foreground/50 font-medium">{item.desc}</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
