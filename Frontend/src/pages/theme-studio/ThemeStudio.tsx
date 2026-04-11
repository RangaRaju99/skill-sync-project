import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout as LayoutIcon, 
  Component, 
  Download, 
  RotateCcw, 
  Smartphone, 
  Tablet, 
  Monitor,
  Undo2,
  Redo2,
  Sparkles,
  Share2
} from 'lucide-react';

import type { RootState } from '../../store';
import { 
  updateColors, 
  updateTypography, 
  updateComponents, 
  updateLayout,
  undo,
  redo,
  setPresetTheme,
  resetTheme
} from '../../store/slices/themeSlice';

import './ThemeStudio.css';
import { hexToRgba, exportTheme } from '../../utils/themeUtils';
import { HexColorPicker } from 'react-colorful';

// Sub-components
const CategoryTab = ({ active, icon: Icon, label, onClick }: any) => (
  <button 
    className={`category-tab ${active ? 'active' : ''}`} 
    onClick={onClick}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const ViewportToggle = ({ active, icon: Icon, onClick }: any) => (
  <button 
    className={`viewport-btn ${active ? 'active' : ''}`} 
    onClick={onClick}
  >
    <Icon size={20} />
  </button>
);

const ThemeStudio: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.present);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'components' | 'layout'>('colors');
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const handleColorChange = (key: string, color: string) => {
    dispatch(updateColors({ [key]: color }));
  };

  const handlePresetChange = (preset: 'minimal' | 'neon' | 'hacker' | 'corporate' | 'auto') => {
    dispatch(setPresetTheme(preset));
  };

  const handleExport = () => {
    exportTheme(theme);
  };

  const handleShare = () => {
    const encoded = btoa(JSON.stringify(theme));
    const url = `${window.location.origin}${window.location.pathname}?theme=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('Theme URL copied to clipboard!');
  };

  return (
    <div className="theme-studio-container">
      {/* Header */}
      <header className="studio-header">
        <div className="studio-logo">
          <Sparkles className="text-primary" />
          <span>Theme Studio <span className="version">v2.0</span></span>
        </div>

        <div className="studio-actions">
          <div className="history-btns">
            <button onClick={() => dispatch(undo())} title="Undo (Ctrl+Z)"><Undo2 size={18}/></button>
            <button onClick={() => dispatch(redo())} title="Redo (Ctrl+Y)"><Redo2 size={18}/></button>
          </div>
          <div className="divider"></div>
          <button className="studio-btn studio-btn-secondary" onClick={() => dispatch(resetTheme())}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="studio-btn studio-btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button className="studio-btn studio-btn-primary" onClick={handleShare}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </header>

      {/* Sidebar Controls */}
      <aside className="studio-sidebar">
        <div className="tabs-nav">
          <CategoryTab active={activeTab === 'colors'} icon={Palette} label="Colors" onClick={() => setActiveTab('colors')} />
          <CategoryTab active={activeTab === 'typography'} icon={Type} label="Typography" onClick={() => setActiveTab('typography')} />
          <CategoryTab active={activeTab === 'components'} icon={Component} label="Components" onClick={() => setActiveTab('components')} />
          <CategoryTab active={activeTab === 'layout'} icon={LayoutIcon} label="Layout" onClick={() => setActiveTab('layout')} />
        </div>

        <div className="controls-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'colors' && (
                <div className="control-group">
                  <h3>Brand Colors</h3>
                  <div className="control-item">
                    <label className="control-label">Primary <span>{theme.colors.primary}</span></label>
                    <div className="color-field" onClick={() => setShowColorPicker(showColorPicker === 'primary' ? null : 'primary')}>
                      <div className="color-preview" style={{ backgroundColor: theme.colors.primary }}></div>
                      {showColorPicker === 'primary' && (
                        <>
                          <div className="picker-overlay" onClick={() => setShowColorPicker(null)}></div>
                          <div className="picker-popover" onClick={e => e.stopPropagation()}>
                            <HexColorPicker color={theme.colors.primary} onChange={(c) => handleColorChange('primary', c)} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="control-item">
                    <label className="control-label">Secondary <span>{theme.colors.secondary}</span></label>
                    <div className="color-field" onClick={() => setShowColorPicker(showColorPicker === 'secondary' ? null : 'secondary')}>
                      <div className="color-preview" style={{ backgroundColor: theme.colors.secondary }}></div>
                      {showColorPicker === 'secondary' && (
                        <>
                          <div className="picker-overlay" onClick={() => setShowColorPicker(null)}></div>
                          <div className="picker-popover" onClick={e => e.stopPropagation()}>
                            <HexColorPicker color={theme.colors.secondary} onChange={(c) => handleColorChange('secondary', c)} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <h3>Surface Colors</h3>
                  <div className="control-item">
                    <label className="control-label">Background</label>
                    <div className="color-field" onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}>
                      <div className="color-preview" style={{ backgroundColor: theme.colors.background }}></div>
                      {showColorPicker === 'background' && (
                        <>
                          <div className="picker-overlay" onClick={() => setShowColorPicker(null)}></div>
                          <div className="picker-popover" onClick={e => e.stopPropagation()}>
                            <HexColorPicker color={theme.colors.background} onChange={(c) => handleColorChange('background', c)} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="control-item">
                    <label className="control-label">Surface</label>
                    <div className="color-field" onClick={() => setShowColorPicker(showColorPicker === 'surface' ? null : 'surface')}>
                      <div className="color-preview" style={{ backgroundColor: theme.colors.surface }}></div>
                      {showColorPicker === 'surface' && (
                        <>
                          <div className="picker-overlay" onClick={() => setShowColorPicker(null)}></div>
                          <div className="picker-popover" onClick={e => e.stopPropagation()}>
                            <HexColorPicker color={theme.colors.surface} onChange={(c) => handleColorChange('surface', c)} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="ai-suggest">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary mb-2">AI Color Harmony</p>
                    <div className="grid grid-cols-2 gap-2">
                       <button className="studio-btn studio-btn-secondary" onClick={() => handlePresetChange('neon')}>
                         <Sparkles size={14} /> Neon
                       </button>
                       <button className="studio-btn studio-btn-secondary" onClick={() => handlePresetChange('hacker')}>
                         <Sparkles size={14} /> Hacker
                       </button>
                       <button className="studio-btn studio-btn-secondary" onClick={() => handlePresetChange('corporate')}>
                         <Sparkles size={14} /> Corporate
                       </button>
                       <button className="studio-btn studio-btn-secondary" onClick={() => handlePresetChange('auto')}>
                         <Sparkles size={14} /> Auto
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'components' && (
                <div className="control-group">
                  <h3>Radius & Spacing</h3>
                  <div className="control-item">
                    <label className="control-label">Button Radius <span>{theme.components.buttonRadius}</span></label>
                    <input 
                      type="range" min="0" max="24" 
                      value={parseInt(theme.components.buttonRadius)} 
                      onChange={(e) => dispatch(updateComponents({ buttonRadius: `${e.target.value}px` }))} 
                    />
                  </div>
                  <div className="control-item">
                    <label className="control-label">Card Radius <span>{theme.components.cardRadius}</span></label>
                    <input 
                      type="range" min="0" max="32" 
                      value={parseInt(theme.components.cardRadius)} 
                      onChange={(e) => dispatch(updateComponents({ cardRadius: `${e.target.value}px` }))} 
                    />
                  </div>

                  <h3>Visual Styles</h3>
                  <div className="control-item">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={theme.components.glassmorphism} 
                        onChange={(e) => dispatch(updateComponents({ glassmorphism: e.target.checked }))} 
                      />
                      Enable Glassmorphism
                    </label>
                  </div>
                  <div className="control-item">
                    <label className="control-label">Animation Speed <span>{theme.components.animationSpeed}x</span></label>
                    <input 
                      type="range" min="0.5" max="2" step="0.1"
                      value={theme.components.animationSpeed} 
                      onChange={(e) => dispatch(updateComponents({ animationSpeed: parseFloat(e.target.value) }))} 
                    />
                  </div>
                </div>
              )}

              {activeTab === 'typography' && (
                <div className="control-group">
                  <h3>Fonts</h3>
                  <div className="control-item">
                    <label className="control-label">Body Font</label>
                    <select 
                      value={theme.typography.fontFamily}
                      onChange={(e) => dispatch(updateTypography({ fontFamily: e.target.value }))}
                    >
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Outfit', sans-serif">Outfit</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                    </select>
                  </div>
                  <div className="control-item">
                    <label className="control-label">Heading Font</label>
                    <select 
                      value={theme.typography.headingFontFamily}
                      onChange={(e) => dispatch(updateTypography({ headingFontFamily: e.target.value }))}
                    >
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Outfit', sans-serif">Outfit</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                    </select>
                  </div>
                  <div className="control-item">
                    <label className="control-label">Base Font Size <span>{theme.typography.baseFontSize}px</span></label>
                    <input 
                      type="range" min="12" max="20" 
                      value={theme.typography.baseFontSize} 
                      onChange={(e) => dispatch(updateTypography({ baseFontSize: parseInt(e.target.value) }))} 
                    />
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div className="control-group">
                  <h3>Layout Density</h3>
                  <div className="density-toggle">
                    <button className={theme.layout.density === 'compact' ? 'active' : ''} onClick={() => dispatch(updateLayout({ density: 'compact' }))}>Compact</button>
                    <button className={theme.layout.density === 'comfortable' ? 'active' : ''} onClick={() => dispatch(updateLayout({ density: 'comfortable' }))}>Comfortable</button>
                    <button className={theme.layout.density === 'spacious' ? 'active' : ''} onClick={() => dispatch(updateLayout({ density: 'spacious' }))}>Spacious</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="studio-main">
        <div className="viewport-controls">
          <ViewportToggle active={viewport === 'mobile'} icon={Smartphone} onClick={() => setViewport('mobile')} />
          <ViewportToggle active={viewport === 'tablet'} icon={Tablet} onClick={() => setViewport('tablet')} />
          <ViewportToggle active={viewport === 'desktop'} icon={Monitor} onClick={() => setViewport('desktop')} />
        </div>

        <div className="preview-container">
          <div className={`mock-app-frame device-${viewport} ${theme.components.glassmorphism ? 'glass' : ''}`}>
            <nav className="mock-nav">
              <div className="logo font-bold text-xl uppercase tracking-tighter" style={{ fontFamily: 'var(--heading-font-family)' }}>SkillSync</div>
              <div className="nav-links flex gap-4 text-sm font-medium">
                <span>Dashboard</span>
                <span>Projects</span>
                <span>Team</span>
                <div className="avatar w-8 h-8 rounded-full bg-primary/20 border border-primary/30"></div>
              </div>
            </nav>

            <div className="mock-body flex">
              <aside className="mock-sidebar flex flex-col gap-6">
                <div className="sidebar-group flex flex-col gap-2">
                  <div className="h-4 w-24 bg-text/5 rounded-full"></div>
                  <div className="h-4 w-32 bg-text/10 rounded-full"></div>
                  <div className="h-4 w-28 bg-text/5 rounded-full"></div>
                </div>
                <div className="sidebar-group flex flex-col gap-2">
                  <div className="h-4 w-20 bg-text/5 rounded-full"></div>
                  <div className="h-4 w-36 bg-text/10 rounded-full"></div>
                </div>
              </aside>

              <main className="mock-content flex-1 p-8 flex flex-col gap-8">
                <header>
                  <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'var(--heading-font-family)' }}>Welcome back, Alex.</h1>
                  <p className="text-textSecondary">You have 3 active projects this week. Keep up the momentum!</p>
                </header>

                <div className="grid grid-cols-2 gap-6">
                  <div className="mock-card">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><StarIcon /></div>
                      <div className="badge px-2 py-1 rounded bg-success/10 text-success text-[10px] font-bold uppercase">Active</div>
                    </div>
                    <h3 className="font-bold mb-1">SkillSync Platform</h3>
                    <p className="text-xs text-textSecondary mb-4">Building the future of peer learning.</p>
                    <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div className="mock-card">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary"><Sparkles size={20}/></div>
                      <div className="badge px-2 py-1 rounded bg-warning/10 text-warning text-[10px] font-bold uppercase">Pending</div>
                    </div>
                    <h3 className="font-bold mb-1">AI Integration</h3>
                    <p className="text-xs text-textSecondary mb-4">Connecting Gemini 2.0 to workspace.</p>
                    <button className="mock-btn w-full text-xs">View Details</button>
                  </div>
                </div>

                <div className="mock-card flex-1">
                   <h3 className="font-bold mb-4">Activity Insights</h3>
                   <div className="flex items-end gap-2 h-32">
                     {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                       <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}>
                         <div className="w-full bg-primary rounded-t-sm" style={{ height: '30%' }}></div>
                       </div>
                     ))}
                   </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default ThemeStudio;
