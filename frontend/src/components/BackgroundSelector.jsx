import React, { useState } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';

export const BACKGROUND_TEMPLATES = [
  { id: 'bg-template-1', name: '1. Modern Crosshatch Weave (Default)', isDark: false, desc: 'User choice favorite diagonal crosshatch' },
  { id: 'bg-template-2', name: '2. Soft Waves & Ambient Mesh', isDark: false, desc: 'Soft pastel gradient mesh' },
  { id: 'bg-template-3', name: '3. Architectural Micro-Grid', isDark: false, desc: 'Precision 24px tech micro-grid' },
  { id: 'bg-template-4', name: '4. Diamond Geometric Lattice', isDark: false, desc: 'Crisp diamond lattice mesh' },
  { id: 'bg-template-5', name: '5. Polka Grid Matrix', isDark: false, desc: 'Classic slate polka dots matrix' },
  { id: 'bg-template-6', name: '6. Chevron Stripes Weave', isDark: false, desc: 'Chevron diagonal stripe grid' },
  { id: 'bg-template-7', name: '7. Midnight Obsidian Mesh', isDark: true, desc: 'Dark obsidian slate weave' },
  { id: 'bg-template-8', name: '8. Glassmorphic Ambient Orbs', isDark: true, desc: 'Glowing blurred ambient orbs' },
  { id: 'bg-template-9', name: '9. Deep Tech Circuit Glow', isDark: true, desc: 'Cyber cyan circuit dots' },
  { id: 'bg-template-10', name: '10. Velvet Indigo Soft Glow', isDark: true, desc: 'Deep luxury velvet indigo spotlight' },
];

const BackgroundSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[100] animate-fade-in">
      {isOpen && (
        <div className="mb-3 bg-white/95 backdrop-blur-md border border-slate-300 rounded-3xl p-4 shadow-2xl w-80 sm:w-96 space-y-3 animate-fade-in-up text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Choose Background Pattern</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-0.5 rounded-md hover:bg-slate-100"
            >
              Close ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-medium leading-normal">
            Click any of the 10 custom patterns below to switch the Login background live:
          </p>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
            {BACKGROUND_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(tmpl.id);
                  localStorage.setItem('selected_bg_template', tmpl.id);
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  selectedTemplate === tmpl.id
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-2xs'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-semibold'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${tmpl.isDark ? 'bg-slate-900' : 'bg-slate-300'}`}></span>
                    <span>{tmpl.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal block pl-4">{tmpl.desc}</span>
                </div>

                {selectedTemplate === tmpl.id && (
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary text-xs font-bold py-2.5 px-4 shadow-xl border border-slate-700/50 flex items-center gap-2 bg-slate-900 hover:bg-black text-white rounded-full group"
        title="Switch Background Template Pattern"
      >
        <Palette className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform" />
        <span>🎨 Select Background ({BACKGROUND_TEMPLATES.find(t => t.id === selectedTemplate)?.name.split('.')[0] || '1'})</span>
      </button>
    </div>
  );
};

export default BackgroundSelector;
