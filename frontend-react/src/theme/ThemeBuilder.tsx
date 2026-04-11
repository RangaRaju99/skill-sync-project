import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { PRESETS, type ThemeTokens, type ThemePreset } from '@/theme/presets';

interface ThemeBuilderProps {
  open: boolean;
  onClose: () => void;
}

const COLOR_FIELDS: { key: keyof ThemeTokens; label: string; group: string }[] = [
  { key: 'primary500', label: 'Primary', group: 'Brand' },
  { key: 'primary600', label: 'Primary Dark', group: 'Brand' },
  { key: 'primary400', label: 'Primary Light', group: 'Brand' },
  { key: 'bgPrimaryLight', label: 'Background', group: 'Light Mode' },
  { key: 'bgSurfaceLight', label: 'Surface', group: 'Light Mode' },
  { key: 'bgCardLight', label: 'Card', group: 'Light Mode' },
  { key: 'textPrimaryLight', label: 'Text', group: 'Light Mode' },
  { key: 'textMutedLight', label: 'Muted Text', group: 'Light Mode' },
  { key: 'borderColorLight', label: 'Border', group: 'Light Mode' },
  { key: 'bgPrimaryDark', label: 'Background', group: 'Dark Mode' },
  { key: 'bgSurfaceDark', label: 'Surface', group: 'Dark Mode' },
  { key: 'bgCardDark', label: 'Card', group: 'Dark Mode' },
  { key: 'textPrimaryDark', label: 'Text', group: 'Dark Mode' },
  { key: 'textMutedDark', label: 'Muted Text', group: 'Dark Mode' },
  { key: 'borderColorDark', label: 'Border', group: 'Dark Mode' },
];

const RADIUS_OPTIONS = [
  { label: 'Sharp', value: '0.25rem' },
  { label: 'Soft', value: '0.5rem' },
  { label: 'Rounded', value: '1rem' },
  { label: 'Pill', value: '1.5rem' },
  { label: 'Ultra', value: '2rem' },
];

export default function ThemeBuilder({ open, onClose }: ThemeBuilderProps) {
  const { activePresetId, activeTokens, switchPreset, applyCustomTokens, mode, setMode, presets } = useTheme();

  const [customTokens, setCustomTokens] = useState<ThemeTokens>({ ...activeTokens });
  const [activeSection, setActiveSection] = useState<'presets' | 'custom'>('presets');

  const handlePresetClick = useCallback((id: string) => {
    switchPreset(id);
    setCustomTokens({ ...PRESETS[id].tokens });
  }, [switchPreset]);

  const updateCustomField = useCallback((key: keyof ThemeTokens, value: string) => {
    setCustomTokens((prev: ThemeTokens) => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyCustom = useCallback(() => {
    applyCustomTokens(customTokens);
  }, [applyCustomTokens, customTokens]);

  if (!open) return null;

  const groups = ['Brand', 'Light Mode', 'Dark Mode'];
  const presetEntries = Object.values(presets) as ThemePreset[];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[440px] h-full bg-card border-l border-border-color shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-xl border-b border-border-color px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">Theme Studio</h2>
            <p className="text-xs font-bold text-muted mt-0.5">Customize your experience</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-surface border border-border-color flex items-center justify-center text-muted hover:text-foreground hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <span className="material-icons text-[20px]">close</span>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 py-5 border-b border-border-color">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-3">Appearance</p>
          <div className="flex gap-2 p-1 bg-surface rounded-xl">
            {(['light', 'dark', 'system'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  mode === m
                    ? 'bg-card shadow-md text-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <span className="material-icons text-[16px] mr-1 align-middle">
                  {m === 'light' ? 'light_mode' : m === 'dark' ? 'dark_mode' : 'auto_mode'}
                </span>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Section Toggle */}
        <div className="px-6 pt-5">
          <div className="flex gap-2 p-1 bg-surface rounded-xl mb-6">
            <button
              onClick={() => setActiveSection('presets')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeSection === 'presets'
                  ? 'bg-card shadow-md text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span className="material-icons text-[16px] mr-1 align-middle">palette</span>
              Presets
            </button>
            <button
              onClick={() => setActiveSection('custom')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeSection === 'custom'
                  ? 'bg-card shadow-md text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span className="material-icons text-[16px] mr-1 align-middle">tune</span>
              Custom
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        {activeSection === 'presets' && (
          <div className="px-6 pb-8 space-y-4 animate-fade-in">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted">Choose a Preset</p>
            <div className="grid grid-cols-2 gap-3">
              {presetEntries.map((preset: ThemePreset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all group hover:shadow-lg ${
                    activePresetId === preset.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-md'
                      : 'border-border-color hover:border-primary-300'
                  }`}
                >
                  {/* Color preview dots */}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-full border border-white/30 shadow-sm" style={{ background: preset.tokens.primary500 }} />
                    <div className="w-5 h-5 rounded-full border border-white/30 shadow-sm" style={{ background: preset.tokens.primary600 }} />
                    <div className="w-5 h-5 rounded-full border border-white/30 shadow-sm" style={{ background: preset.tokens.primary700 }} />
                  </div>
                  <p className="text-sm font-bold text-foreground">{preset.name}</p>
                  <p className="text-[10px] font-bold text-muted mt-0.5">Radius: {preset.tokens.borderRadius}</p>
                  {activePresetId === preset.id && (
                    <div className="absolute top-3 right-3">
                      <span className="material-icons text-primary-500 text-[18px]">check_circle</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Builder */}
        {activeSection === 'custom' && (
          <div className="px-6 pb-8 space-y-6 animate-fade-in">
            {groups.map(group => (
              <div key={group}>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-3">{group}</p>
                <div className="space-y-2">
                  {COLOR_FIELDS.filter(f => f.group === group).map(field => (
                    <div key={field.key} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                      <span className="text-xs font-bold text-foreground">{field.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted">{customTokens[field.key]}</span>
                        <label className="relative cursor-pointer">
                          <div
                            className="w-8 h-8 rounded-lg border-2 border-border-color shadow-sm transition-all hover:scale-110"
                            style={{ background: customTokens[field.key] }}
                          />
                          <input
                            type="color"
                            value={customTokens[field.key]}
                            onChange={e => updateCustomField(field.key, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Border Radius */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-3">Border Radius</p>
              <div className="flex gap-2 flex-wrap">
                {RADIUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateCustomField('borderRadius', opt.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      customTokens.borderRadius === opt.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600'
                        : 'border-border-color text-muted hover:border-primary-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply button */}
            <button
              onClick={handleApplyCustom}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-[18px]">auto_fix_high</span>
              Apply Custom Theme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
