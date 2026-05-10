import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, RotateCcw, Check, Sparkles, Layout, Palette, Type, Box, Sliders, Eye, Zap } from 'lucide-react';
import { useTheme, type BackgroundStyle, type CardStyle, type FontStyle } from '../../context/ThemeContext';

const ACCENT_COLORS = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Slate', value: '#475569' },
];

const PRESETS = [
  { 
    name: 'Cyber', 
    colors: { primaryColor: '#0ea5e9', backgroundStyle: 'midnight', cardStyle: 'neon', borderRadius: '0', fontStyle: 'Space Grotesk', glassBlur: 4, glassTransparency: 0.05, glowIntensity: 1 } 
  },
  { 
    name: 'Lucid', 
    colors: { primaryColor: '#8b5cf6', backgroundStyle: 'glass', cardStyle: 'glass', borderRadius: '1.2', fontStyle: 'Outfit', glassBlur: 20, glassTransparency: 0.1, glowIntensity: 0.5 } 
  },
  { 
    name: 'Ghost', 
    colors: { primaryColor: '#f8fafc', backgroundStyle: 'amoled', cardStyle: 'minimal', borderRadius: '0.4', fontStyle: 'Inter', glassBlur: 0, glassTransparency: 0, glowIntensity: 0.2 } 
  },
];

const ThemeSettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preset' | 'look' | 'vfx' | 'layout'>('preset');
  const { settings, updateSettings, resetToDefault, theme, toggleTheme } = useTheme();

  const containerVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  };

  const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1.5 py-3 transition-all relative ${
        activeTab === id ? 'text-primary' : 'text-white/30 hover:text-white/60'
      }`}
    >
      <Icon size={18} />
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      {activeTab === id && (
        <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
      )}
    </button>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[60] w-14 h-14 bg-primary text-white rounded-[1.25rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
        <Settings size={24} className={`relative z-10 ${isOpen ? 'rotate-90' : ''} transition-transform duration-500`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-card border-l border-white/10 z-[101] shadow-2xl overflow-hidden flex flex-col"
              style={{ background: 'rgba(10, 5, 20, 0.95)', backdropFilter: 'blur(40px)' }}
            >
              {/* Header */}
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic">Studio<span className="text-primary text-3xl">.</span></h2>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Advanced Personalization</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-4 px-4 bg-white/[0.02] border-b border-white/5">
                <TabButton id="preset" icon={Sparkles} label="Presets" />
                <TabButton id="look" icon={Palette} label="Look" />
                <TabButton id="vfx" icon={Zap} label="VFX" />
                <TabButton id="layout" icon={Layout} label="Layout" />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeTab === 'preset' && (
                    <motion.div key="preset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                      <div className="grid grid-cols-1 gap-4">
                        {PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => updateSettings(preset.colors as any)}
                            className={`group relative p-6 rounded-[2rem] border text-left transition-all ${
                              settings.primaryColor === preset.colors.primaryColor ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">{preset.name}</h4>
                              {settings.primaryColor === preset.colors.primaryColor && <Check size={16} className="text-primary" />}
                            </div>
                            <div className="flex gap-2">
                              <div className="w-8 h-2 rounded-full bg-primary" />
                              <div className="w-12 h-2 rounded-full bg-white/10" />
                              <div className="w-6 h-2 rounded-full bg-white/5" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'look' && (
                    <motion.div key="look" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                      {/* Accent Color */}
                      <section>
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <Palette size={14} /> Color Core
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {ACCENT_COLORS.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => updateSettings({ primaryColor: color.value })}
                              className={`w-10 h-10 rounded-2xl border-2 transition-all flex items-center justify-center ${
                                settings.primaryColor === color.value ? 'border-primary scale-110 rotate-3' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: color.value }}
                            >
                              {settings.primaryColor === color.value && <Check size={16} className="text-white" />}
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Typography */}
                      <section>
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <Type size={14} /> Typography
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {['Outfit', 'Inter', 'Space Grotesk', 'Manrope'].map((font) => (
                            <button
                              key={font}
                              onClick={() => updateSettings({ fontStyle: font as FontStyle })}
                              className={`p-4 rounded-2xl border text-center transition-all ${
                                settings.fontStyle === font ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.03] text-white/50'
                              }`}
                              style={{ fontFamily: font }}
                            >
                              <span className="text-sm font-bold uppercase tracking-widest">{font}</span>
                            </button>
                          ))}
                        </div>
                      </section>
                    </motion.div>
                  )}

                  {activeTab === 'vfx' && (
                    <motion.div key="vfx" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                      <section className="space-y-8">
                        {[
                          { label: 'Glass Blur', key: 'glassBlur', min: 0, max: 40, step: 1, suffix: 'px' },
                          { label: 'Transparency', key: 'glassTransparency', min: 0, max: 0.5, step: 0.01, suffix: '' },
                          { label: 'Noise Density', key: 'noiseOpacity', min: 0, max: 0.2, step: 0.01, suffix: '' },
                          { label: 'Glow Intensity', key: 'glowIntensity', min: 0, max: 2, step: 0.1, suffix: '' },
                        ].map((s) => (
                          <div key={s.key}>
                            <div className="flex justify-between items-center mb-4">
                              <label className="text-[10px] font-black text-white uppercase tracking-widest">{s.label}</label>
                              <span className="text-[10px] font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">{String((settings as any)[s.key])}{s.suffix}</span>
                            </div>
                            <input 
                              type="range" min={s.min} max={s.max} step={s.step} 
                              value={(settings as any)[s.key]}
                              onChange={(e) => updateSettings({ [s.key]: parseFloat(e.target.value) })}
                              className="w-full accent-primary appearance-none h-1 bg-white/5 rounded-full"
                            />
                          </div>
                        ))}
                      </section>
                    </motion.div>
                  )}

                  {activeTab === 'layout' && (
                    <motion.div key="layout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                      <section>
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <Box size={14} /> Surface Geometry
                        </h3>
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-[10px] font-black text-white uppercase tracking-widest">Border Radius</label>
                          <span className="text-[10px] font-bold text-primary font-mono">{settings.borderRadius}rem</span>
                        </div>
                        <input 
                          type="range" min="0" max="2.5" step="0.1" 
                          value={settings.borderRadius}
                          onChange={(e) => updateSettings({ borderRadius: e.target.value })}
                          className="w-full accent-primary appearance-none h-1 bg-white/5 rounded-full"
                        />
                      </section>

                      <section>
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <Layout size={14} /> Background Style
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {['default', 'midnight', 'amoled', 'glass', 'gradient'].map((style) => (
                            <button
                              key={style}
                              onClick={() => updateSettings({ backgroundStyle: style as BackgroundStyle })}
                              className={`p-4 rounded-2xl border text-center transition-all ${
                                settings.backgroundStyle === style ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.03] text-white/50'
                              }`}
                            >
                              <span className="text-[10px] font-black uppercase tracking-widest">{style}</span>
                            </button>
                          ))}
                        </div>
                      </section>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Preview & Actions */}
              <div className="p-8 bg-white/[0.01] border-t border-white/5 space-y-6">
                <div className="glass-card rounded-3xl p-6 border-white/10 relative overflow-hidden group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                      <Eye size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Live Studio Preview</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-0.5">Real-time simulation</p>
                    </div>
                  </div>
                  <div 
                    className="h-24 w-full rounded-2xl transition-all border border-white/10 flex items-center justify-center relative overflow-hidden"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      backdropFilter: `blur(${settings.glassBlur}px)`,
                      borderRadius: `${settings.borderRadius}rem`
                    }}
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-40" />
                    <div className="w-12 h-2 rounded-full bg-primary/40 mb-2" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={resetToDefault}
                    className="flex-1 py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                  <button 
                    onClick={toggleTheme}
                    className="flex-1 py-4 px-6 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                  >
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
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
