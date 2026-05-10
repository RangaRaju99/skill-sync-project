import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, RotateCcw, Check, Sparkles, Layout, Palette, Type, Box } from 'lucide-react';
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
    name: 'Cyberpunk', 
    colors: { primaryColor: '#0ea5e9', backgroundStyle: 'midnight', cardStyle: 'neon', borderRadius: '0', fontStyle: 'Space Grotesk' } 
  },
  { 
    name: 'Ocean', 
    colors: { primaryColor: '#06b6d4', backgroundStyle: 'gradient', cardStyle: 'glass', borderRadius: '1', fontStyle: 'Manrope' } 
  },
  { 
    name: 'Forest', 
    colors: { primaryColor: '#10b981', backgroundStyle: 'default', cardStyle: 'minimal', borderRadius: '0.4', fontStyle: 'Outfit' } 
  },
];

const ThemeSettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, resetToDefault, theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <Settings size={22} className={isOpen ? 'rotate-90' : ''} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-outline-variant/20 z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Theme Settings</h2>
                    <p className="text-xs text-on-surface-variant font-medium">Personalize your experience</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-surface-container rounded-full">
                    <X size={20} />
                  </button>
                </div>

                {/* Quick Presets */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">SaaS Presets</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => updateSettings(preset.colors as any)}
                        className="p-2 text-[10px] font-bold border border-outline-variant/10 bg-surface-container-low rounded-lg hover:border-primary/50 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Accent Color */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">Accent Color</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => updateSettings({ primaryColor: color.value })}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          settings.primaryColor === color.value ? 'border-primary scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                      >
                        {settings.primaryColor === color.value && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Background Style */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Box size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">Background Style</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['default', 'midnight', 'amoled', 'glass', 'gradient'].map((style) => (
                      <button
                        key={style}
                        onClick={() => updateSettings({ backgroundStyle: style as BackgroundStyle })}
                        className={`p-2 text-[10px] font-bold border rounded-lg transition-all capitalize ${
                          settings.backgroundStyle === style ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/10 bg-surface-container-low'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Card Style */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Layout size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">Card Style</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['flat', 'glass', 'elevated', 'neon', 'minimal'].map((style) => (
                      <button
                        key={style}
                        onClick={() => updateSettings({ cardStyle: style as CardStyle })}
                        className={`p-2 text-[10px] font-bold border rounded-lg transition-all capitalize ${
                          settings.cardStyle === style ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/10 bg-surface-container-low'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Font Style */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Type size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">Typography</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Outfit', 'Inter', 'Poppins', 'Space Grotesk', 'Manrope'].map((font) => (
                      <button
                        key={font}
                        onClick={() => updateSettings({ fontStyle: font as FontStyle })}
                        className={`p-3 text-xs font-medium border rounded-xl transition-all ${
                          settings.fontStyle === font ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/10 bg-surface-container-low'
                        }`}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Geometry */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Box size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">Radius: {settings.borderRadius}rem</h3>
                  </div>
                  <input 
                    type="range" min="0" max="2" step="0.2" 
                    value={settings.borderRadius}
                    onChange={(e) => updateSettings({ borderRadius: e.target.value })}
                    className="w-full accent-primary"
                  />
                </section>

                {/* Appearance Mode */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Layout size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">Appearance</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={toggleTheme}
                      className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all ${
                        theme === 'light' ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-low'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded-lg shadow-inner" />
                      <span className="text-xs font-bold">Light</span>
                    </button>
                    <button
                      onClick={toggleTheme}
                      className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all ${
                        theme === 'dark' ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-low'
                      }`}
                    >
                      <div className="w-full h-12 bg-[#0a0514] rounded-lg shadow-inner" />
                      <span className="text-xs font-bold">Dark</span>
                    </button>
                  </div>
                </section>

                {/* Reset */}
                <div className="pt-8 flex gap-4">
                  <button 
                    onClick={resetToDefault}
                    className="flex-1 py-3 px-4 border border-outline-variant/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
                  >
                    <RotateCcw size={16} /> Reset All
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
