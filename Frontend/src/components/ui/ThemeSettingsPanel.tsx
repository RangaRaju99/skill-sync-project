import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, RotateCcw, Sparkles, Type, Box, 
  Eye, Zap, Sliders, Brush, MousePointer2
} from 'lucide-react';
import { useTheme, type CardStyle, type FontStyle, type CustomThemeSettings } from '../../context/ThemeContext';

const ACCENT_COLORS = [
  { name: 'Amethyst', value: '#8b5cf6', desc: 'Creative & Deep' },
  { name: 'Azure', value: '#3b82f6', desc: 'Calm & Trust' },
  { name: 'Cyan', value: '#06b6d4', desc: 'Fresh & Modern' },
  { name: 'Emerald', value: '#10b981', desc: 'Organic & Growth' },
  { name: 'Amber', value: '#f59e0b', desc: 'Warm & Active' },
  { name: 'Rose', value: '#f43f5e', desc: 'Bold & Passion' },
  { name: 'Slate', value: '#475569', desc: 'Professional' },
];

const PRESETS = [
  { 
    name: 'Cyberpunk Neon', 
    id: 'cyber',
    colors: { primaryColor: '#0ea5e9', backgroundStyle: 'midnight', cardStyle: 'neon', borderRadius: '0', fontStyle: 'Space Grotesk', blurIntensity: 15, glowStrength: 0.8, transparency: 0.1 } 
  },
  { 
    name: 'Arctic Glass', 
    id: 'arctic',
    colors: { primaryColor: '#06b6d4', backgroundStyle: 'glass', cardStyle: 'glass', borderRadius: '1.2', fontStyle: 'Inter', blurIntensity: 20, glowStrength: 0.2, transparency: 0.05 } 
  },
  { 
    name: 'Midnight Pro', 
    id: 'midnight',
    colors: { primaryColor: '#8b5cf6', backgroundStyle: 'amoled', cardStyle: 'elevated', borderRadius: '0.6', fontStyle: 'Outfit', blurIntensity: 0, glowStrength: 0.3, transparency: 0.02 } 
  },
  { 
    name: 'Forest Zen', 
    id: 'forest',
    colors: { primaryColor: '#10b981', backgroundStyle: 'default', cardStyle: 'minimal', borderRadius: '0.4', fontStyle: 'Outfit', blurIntensity: 8, glowStrength: 0.1, transparency: 0.03 } 
  },
];

type TabType = 'vibe' | 'style' | 'geometry' | 'presets';

const MockAppPreview = ({ settings }: { settings: CustomThemeSettings }) => {
  return (
    <div className="w-full aspect-[4/3] bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden relative shadow-2xl transition-all">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 0% 0%, ${settings.primaryColor}, transparent 50%)` }} />
      
      {/* Mini Nav */}
      <div className="h-8 border-b border-outline-variant/10 flex items-center px-3 gap-2 bg-surface/50 backdrop-blur-sm relative z-10">
        <div className="w-2 h-2 rounded-full bg-primary/40" />
        <div className="flex-1 h-2 bg-on-surface/5 rounded-full" />
        <div className="w-4 h-4 rounded-full bg-primary/20" />
      </div>

      <div className="flex h-full pb-8">
        {/* Sidebar */}
        <div className="w-12 border-r border-outline-variant/10 p-2 space-y-2 bg-surface/30">
          <div className="w-full h-2 bg-primary/20 rounded" />
          <div className="w-full h-2 bg-on-surface/5 rounded" />
          <div className="w-full h-2 bg-on-surface/5 rounded" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          <div className="space-y-1">
            <div className="h-3 w-1/2 bg-on-surface/10 rounded" />
            <div className="h-2 w-3/4 bg-on-surface/5 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="bg-surface-container-lowest p-3 border border-outline-variant/10 rounded-lg shadow-sm" style={{ fontFamily: settings.fontStyle }}>
                <div className="w-6 h-6 rounded bg-primary/20 mb-2" />
                <div className="h-2 w-full bg-on-surface/10 rounded mb-1" />
                <div className="h-2 w-2/3 bg-on-surface/5 rounded" />
             </div>
             <div className="bg-surface-container-lowest p-3 border border-outline-variant/10 rounded-lg shadow-sm">
                <div className="w-full h-8 bg-primary rounded flex items-center justify-center">
                  <div className="h-1 w-1/2 bg-white/40 rounded-full" />
                </div>
             </div>
          </div>

          <div className="bg-surface-container-lowest p-4 border border-outline-variant/10 rounded-lg shadow-sm h-16 relative overflow-hidden">
             <div className="flex items-end gap-1 h-full">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/30 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThemeSettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('vibe');
  const { settings, updateSettings, resetToDefault, theme, toggleTheme } = useTheme();

  const handleUpdate = (updates: Partial<CustomThemeSettings>) => {
    updateSettings(updates);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[100] group"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/40 transition-colors" />
        <div className="relative w-14 h-14 bg-surface border border-outline-variant/20 rounded-2xl flex items-center justify-center shadow-2xl group-hover:-translate-y-1 transition-all duration-300">
           <MousePointer2 size={24} className="text-primary group-hover:rotate-12 transition-transform" />
           <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-4 border-surface" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />

            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-surface/95 border-l border-outline-variant/10 z-[201] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-8 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-black tracking-tighter text-on-surface uppercase">Studio</h2>
                  <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Personalize Workspace</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-on-surface/5 hover:bg-on-surface/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-8 mb-8">
                <div className="flex bg-on-surface/5 p-1 rounded-xl">
                  {(['vibe', 'style', 'geometry', 'presets'] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        activeTab === tab ? 'bg-surface text-primary shadow-sm' : 'text-on-surface/40 hover:text-on-surface'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-12">
                {/* ── LIVE PREVIEW ── */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Live Evolution</h3>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[8px] font-bold text-green-500/80 uppercase tracking-tighter">Sync Active</span>
                    </div>
                  </div>
                  <MockAppPreview settings={settings} />
                </section>

                <AnimatePresence mode="wait">
                  {activeTab === 'vibe' && (
                    <motion.div
                      key="vibe"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-10"
                    >
                      {/* Accent Picker */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2">
                           <Brush size={16} className="text-primary" />
                           <h4 className="text-xs font-bold uppercase tracking-widest">Choose your vibe</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {ACCENT_COLORS.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => handleUpdate({ primaryColor: color.value })}
                              className={`p-4 rounded-2xl border transition-all flex flex-col items-start gap-3 text-left group ${
                                settings.primaryColor === color.value ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-outline-variant/5 bg-on-surface/5 hover:border-outline-variant/20'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-xl shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: color.value }} />
                              <div>
                                <div className="text-xs font-bold">{color.name}</div>
                                <div className="text-[9px] text-on-surface-muted uppercase tracking-tighter">{color.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Appearance Mode */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2">
                           <Eye size={16} className="text-primary" />
                           <h4 className="text-xs font-bold uppercase tracking-widest">Appearance</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => theme !== 'light' && toggleTheme()}
                            className={`relative p-1 rounded-2xl border-2 overflow-hidden transition-all ${
                              theme === 'light' ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 grayscale'
                            }`}
                          >
                            <div className="bg-slate-50 p-3 h-24 space-y-2">
                               <div className="w-1/2 h-2 bg-slate-200 rounded" />
                               <div className="w-full h-8 bg-white border border-slate-100 rounded shadow-sm" />
                            </div>
                            <div className="p-2 bg-surface text-[10px] font-bold text-center">Day Mode</div>
                          </button>
                          <button
                            onClick={() => theme !== 'dark' && toggleTheme()}
                            className={`relative p-1 rounded-2xl border-2 overflow-hidden transition-all ${
                              theme === 'dark' ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 grayscale'
                            }`}
                          >
                            <div className="bg-[#0a0514] p-3 h-24 space-y-2">
                               <div className="w-1/2 h-2 bg-white/5 rounded" />
                               <div className="w-full h-8 bg-white/5 border border-white/5 rounded" />
                            </div>
                            <div className="p-2 bg-surface text-[10px] font-bold text-center">Night Mode</div>
                          </button>
                        </div>
                      </section>
                    </motion.div>
                  )}

                  {activeTab === 'style' && (
                    <motion.div
                      key="style"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-10"
                    >
                      {/* Card Personality */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2">
                           <Zap size={16} className="text-primary" />
                           <h4 className="text-xs font-bold uppercase tracking-widest">Interface Personality</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {['flat', 'glass', 'elevated', 'neon', 'minimal'].map((style) => (
                            <button
                              key={style}
                              onClick={() => handleUpdate({ cardStyle: style as CardStyle })}
                              className={`p-4 rounded-xl border-2 transition-all text-left capitalize ${
                                settings.cardStyle === style ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-on-surface/5'
                              }`}
                            >
                              <span className="text-xs font-bold">{style}</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Effects Sliders */}
                      <section className="space-y-8">
                        <div className="flex items-center gap-2">
                           <Sliders size={16} className="text-primary" />
                           <h4 className="text-xs font-bold uppercase tracking-widest">Visual Atmosphere</h4>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Blur Intensity</label>
                              <span className="text-[10px] font-mono text-primary font-bold">{settings.blurIntensity}px</span>
                            </div>
                            <input type="range" min="0" max="40" value={settings.blurIntensity} onChange={(e) => handleUpdate({ blurIntensity: parseInt(e.target.value) })} className="w-full accent-primary" />
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Surface Opacity</label>
                              <span className="text-[10px] font-mono text-primary font-bold">{Math.round(settings.transparency * 100)}%</span>
                            </div>
                            <input type="range" min="0.01" max="0.3" step="0.01" value={settings.transparency} onChange={(e) => handleUpdate({ transparency: parseFloat(e.target.value) })} className="w-full accent-primary" />
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Glow Strength</label>
                              <span className="text-[10px] font-mono text-primary font-bold">{Math.round(settings.glowStrength * 100)}%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.1" value={settings.glowStrength} onChange={(e) => handleUpdate({ glowStrength: parseFloat(e.target.value) })} className="w-full accent-primary" />
                          </div>
                        </div>
                      </section>
                    </motion.div>
                  )}

                  {activeTab === 'geometry' && (
                    <motion.div
                      key="geometry"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-10"
                    >
                      {/* Typography */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2">
                           <Type size={16} className="text-primary" />
                           <h4 className="text-xs font-bold uppercase tracking-widest">Brand Voice</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {['Outfit', 'Inter', 'Poppins', 'Space Grotesk', 'Manrope'].map((font) => (
                            <button
                              key={font}
                              onClick={() => handleUpdate({ fontStyle: font as FontStyle })}
                              className={`p-5 rounded-2xl border-2 transition-all text-left ${
                                settings.fontStyle === font ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-on-surface/5'
                              }`}
                            >
                              <div className="text-lg mb-1" style={{ fontFamily: font }}>Aa</div>
                              <div className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{font}</div>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Radius */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2">
                           <Box size={16} className="text-primary" />
                           <h4 className="text-xs font-bold uppercase tracking-widest">Corner Language</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-end">
                              <div className="flex gap-2">
                                {[0, 0.4, 0.8, 1.2, 1.6].map(r => (
                                  <div key={r} className="w-6 h-6 border-2 border-primary/20 bg-primary/5" style={{ borderRadius: `${r}rem` }} />
                                ))}
                              </div>
                              <span className="text-xs font-mono font-bold text-primary">{settings.borderRadius}rem</span>
                           </div>
                           <input type="range" min="0" max="2" step="0.2" value={settings.borderRadius} onChange={(e) => handleUpdate({ borderRadius: e.target.value })} className="w-full accent-primary" />
                        </div>
                      </section>
                    </motion.div>
                  )}

                  {activeTab === 'presets' && (
                    <motion.div
                      key="presets"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 gap-4"
                    >
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleUpdate(preset.colors as any)}
                          className="relative group p-1 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: `linear-gradient(to bottom right, ${preset.colors.primaryColor}, transparent)` }} />
                          <div className="relative p-6 rounded-[1.8rem] bg-on-surface/5 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-white/10" style={{ backgroundColor: preset.colors.primaryColor }}>
                                   <Sparkles size={20} className="text-white" />
                                </div>
                                <div className="text-left">
                                   <h4 className="text-sm font-display font-bold">{preset.name}</h4>
                                   <p className="text-[10px] text-on-surface-muted uppercase tracking-tighter">Curated Design System</p>
                                </div>
                             </div>
                             <div className="flex gap-1">
                                <div className="w-1.5 h-6 bg-primary/40 rounded-full" />
                                <div className="w-1.5 h-4 bg-primary/20 rounded-full" />
                             </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-8 pt-6 border-t border-outline-variant/10 bg-surface/80 backdrop-blur-md absolute bottom-0 inset-x-0">
                <div className="flex gap-4">
                   <button 
                    onClick={resetToDefault}
                    className="flex-1 py-4 border border-outline-variant/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-on-surface/5 transition-colors"
                  >
                    <RotateCcw size={14} /> Factory Reset
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeSettingsPanel;
