"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PortfolioIcon } from '@/components/ui/PortfolioIcon';
import { ThemeSwitcher } from '@/components/features/ThemeSwitcher';
import { motion, AnimatePresence } from 'motion/react';

interface FontFileItem {
  file: string;
  originalFile: string;
  style: 'normal' | 'italic';
  isVariable: boolean;
  weight: string;
  weightMin: number;
  weightMax: number;
  format: string;
  postscriptName: string;
}

interface FontFamily {
  family: string;
  isVariable: boolean;
  files: FontFileItem[];
}

interface Manifest {
  generatedAt: string;
  fonts: FontFamily[];
}

type StepMode = 1 | 10 | 100;

function getFallbackGeneric(familyName: string): string {
  const name = familyName.toLowerCase();
  if (name.includes('mono') || name.includes('fira code') || name.includes('jetbrains') || name.includes('dejavu') || name.includes('ia writer')) {
    return 'monospace';
  }
  if (name.includes('newsreader') || name.includes('serif') || name.includes('times')) {
    return 'serif';
  }
  if (name.includes('script') || name.includes('swash')) {
    return 'cursive';
  }
  return 'sans-serif';
}

function buildCss2Url(apiBase: string, font: FontFamily, selectedWeights: number[], selectedItalic: boolean): string {
  const familyParam = encodeURIComponent(font.family);

  if (font.isVariable) {
    const minW = Math.min(...font.files.map(f => f.weightMin));
    const maxW = Math.max(...font.files.map(f => f.weightMax));
    const hasItalic = font.files.some(f => f.style === 'italic');

    if (hasItalic) {
      return `${apiBase}/css2?family=${familyParam}:ital,wght@0,${minW}..${maxW};1,${minW}..${maxW}&display=swap`;
    }
    return `${apiBase}/css2?family=${familyParam}:wght@${minW}..${maxW}&display=swap`;
  }

  // Static fonts: format weights like wght@400;700 or ital,wght@0,400;0,700;1,400
  const sortedWeights = [...selectedWeights].sort((a, b) => a - b);
  const weightsToUse = sortedWeights.length > 0 ? sortedWeights : [400];

  const hasItalicFiles = font.files.some(f => f.style === 'italic');

  if (hasItalicFiles && selectedItalic) {
    const segments = weightsToUse.map(w => `0,${w}`).concat(weightsToUse.map(w => `1,${w}`));
    return `${apiBase}/css2?family=${familyParam}:ital,wght@${segments.join(';')}&display=swap`;
  }

  return `${apiBase}/css2?family=${familyParam}:wght@${weightsToUse.join(';')}&display=swap`;
}

export default function FontsCatalogPage() {
  const [mounted, setMounted] = useState(false);
  const [fonts, setFonts] = useState<FontFamily[]>([]);
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(24);
  const [activeCategory, setActiveCategory] = useState<'all' | 'variable' | 'sans' | 'mono'>('all');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Step modes per font family: 1, 10, or 100
  const [stepModeMap, setStepModeMap] = useState<Record<string, StepMode>>({});

  // Map of familyName -> selected weight numbers (for static fonts)
  const [selectedWeightsMap, setSelectedWeightsMap] = useState<Record<string, number[]>>({});
  // Map of familyName -> active preview weight
  const [activePreviewWeightMap, setActivePreviewWeightMap] = useState<Record<string, number>>({});
  // Map of familyName -> italic active
  const [italicMap, setItalicMap] = useState<Record<string, boolean>>({});

  const previewTargetsRef = useRef<Map<string, HTMLElement>>(new Map());
  const apiBase = typeof window !== 'undefined' ? window.location.origin : '';
  const rootPortfolioUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/';
    const host = window.location.host;
    if (host.includes('tigerfolio.com')) return 'https://tigerfolio.com';
    if (host.includes('timchinye.com')) return 'https://timchinye.com';
    return 'http://localhost:3000';
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch('/hosted-fonts-manifest')
      .then(res => res.json())
      .then((data: Manifest) => {
        const loadedFonts = data.fonts || [];
        setFonts(loadedFonts);

        const initialWeights: Record<string, number[]> = {};
        const initialPreviewWeights: Record<string, number> = {};
        const initialItalics: Record<string, boolean> = {};
        const initialSteps: Record<string, StepMode> = {};

        loadedFonts.forEach(f => {
          const distinctWeights = Array.from(new Set(f.files.map(file => file.weightMin)));
          initialWeights[f.family] = distinctWeights;
          initialPreviewWeights[f.family] = f.isVariable ? 400 : (distinctWeights[0] || 400);
          initialItalics[f.family] = false;
          initialSteps[f.family] = 100; // default to standard 100-step
        });

        setSelectedWeightsMap(initialWeights);
        setActivePreviewWeightMap(initialPreviewWeights);
        setItalicMap(initialItalics);
        setStepModeMap(initialSteps);
      })
      .catch(() => setFonts([]));
  }, []);

  // Dynamically load ALL hosted fonts into DOM for live preview
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css2';
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  // Synchronize external updates to sampleText across all unfocused preview cards
  useEffect(() => {
    previewTargetsRef.current.forEach((target) => {
      if (target && target !== document.activeElement && target.innerText !== sampleText) {
        target.innerText = sampleText;
      }
    });
  }, [sampleText]);

  const copyToClipboard = useCallback((text: string, msg: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast({ message: msg, visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 2200);
    });
  }, []);

  const applyPreset = (text: string) => {
    setSampleText(text);
    previewTargetsRef.current.forEach(target => {
      if (target) target.innerText = text;
    });
  };

  const toggleWeightSelection = (family: string, weight: number) => {
    setSelectedWeightsMap(prev => {
      const current = prev[family] || [];
      const exists = current.includes(weight);
      const updated = exists ? current.filter(w => w !== weight) : [...current, weight];
      return { ...prev, [family]: updated.length > 0 ? updated : [weight] };
    });

    setActivePreviewWeightMap(prev => ({ ...prev, [family]: weight }));
  };

  const toggleSelectAllWeights = (family: string, allWeights: number[]) => {
    setSelectedWeightsMap(prev => {
      const current = prev[family] || [];
      const allSelected = allWeights.every(w => current.includes(w));
      return { ...prev, [family]: allSelected ? [allWeights[0]] : allWeights };
    });
  };

  const toggleItalicState = (family: string) => {
    setItalicMap(prev => ({ ...prev, [family]: !prev[family] }));
  };

  const handleVariableSlider = (family: string, val: number) => {
    setActivePreviewWeightMap(prev => ({ ...prev, [family]: val }));
  };

  const setStepMode = (family: string, step: StepMode) => {
    setStepModeMap(prev => ({ ...prev, [family]: step }));

    // Snap current value to the selected step
    setActivePreviewWeightMap(prev => {
      const currentVal = prev[family] || 400;
      const snapped = Math.round(currentVal / step) * step;
      return { ...prev, [family]: snapped };
    });
  };

  const getCategoryFromFont = (font: FontFamily): ('variable' | 'sans' | 'mono')[] => {
    const cats: ('variable' | 'sans' | 'mono')[] = [];
    if (font.isVariable) cats.push('variable');
    const familyLower = font.family.toLowerCase();
    if (familyLower.includes('mono') || familyLower.includes('fira code') || familyLower.includes('jetbrains') || familyLower.includes('dejavu') || familyLower.includes('ia writer')) {
      cats.push('mono');
    } else {
      cats.push('sans');
    }
    return cats;
  };

  const filteredFonts = useMemo(() => {
    return fonts.filter(font => {
      if (activeCategory === 'all') return true;
      const cats = getCategoryFromFont(font);
      return cats.includes(activeCategory);
    });
  }, [fonts, activeCategory]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F5F5EF] dark:bg-[#1A1A17] flex items-center justify-center font-sans">
        <div className="text-[#2F2F2B] dark:text-[#F5F5EF]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5EF] dark:bg-[#1A1A17] text-[#2F2F2B] dark:text-[#F5F5EF] font-sans transition-colors duration-200 antialiased selection:bg-[#D9D24D] selection:text-black">
      {/* Toast Notification */}
      <AnimatePresence mode="wait">
        {toast.visible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#2F2F2B] text-[#F5F5EF] dark:bg-[#F5F5EF] dark:text-[#2F2F2B] px-4 py-3 rounded-xl shadow-2xl border border-[#2F2F2B]/15 dark:border-white/10 text-xs font-mono font-medium"
          >
            <svg className="w-4 h-4 text-[#D9D24D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <header className="w-full bg-[#F5F5EF] dark:bg-[#1A1A17] border-b border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            <div className="flex items-center gap-3">
              <a 
                href={rootPortfolioUrl} 
                aria-label="Return to portfolio homepage" 
                className="pointer-events-auto transition-transform hover:scale-105"
              >
                <div className="w-10 h-10 rounded-xl bg-[#A69552] dark:text-black text-[#F5F5EF] flex items-center justify-center shadow-sm p-1.5">
                  <PortfolioIcon 
                    className="w-full h-full" 
                    bgClass="" 
                    strokeClass="" 
                    scale={0.65} 
                    translateX={11} 
                    translateY={14} 
                  />
                </div>
              </a>
              <div>
                <span className="font-bold tracking-tight text-sm md:text-base font-sans">Custom Fonts CDN</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-[#E9E8B1]/20 dark:bg-[#2F2F2B] border border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15 rounded-xl p-1.5 pr-2.5 text-xs font-mono">
                <span className="px-2 py-0.5 bg-[#E9E8B1]/40 dark:bg-[#1A1A17] rounded-md text-[10px] uppercase font-semibold tracking-wider text-[#A69552]">Endpoint</span>
                <code className="text-[#2F2F2B] dark:text-[#F5F5EF] select-all font-semibold">{apiBase}/css2</code>
                <button 
                  onClick={() => copyToClipboard(`${apiBase}/css2`, 'Endpoint URL copied!')}
                  className="text-[#2F2F2B]/60 hover:text-[#2F2F2B] dark:text-[#F5F5EF]/60 dark:hover:text-white transition-colors cursor-pointer"
                  title="Copy endpoint"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <div className="bg-[#F5F5EF] dark:bg-[#2F2F2B]/50 rounded-2xl border border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            <div className="lg:col-span-6 relative flex items-center">
              <svg className="w-4 h-4 absolute left-3.5 text-[#2F2F2B]/50 dark:text-[#F5F5EF]/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <input 
                type="text" 
                placeholder="Type sample text to preview fonts..." 
                value={sampleText}
                onChange={(e) => applyPreset(e.target.value)}
                className="w-full bg-[#E9E8B1]/20 dark:bg-[#1A1A17] border border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15 rounded-xl pl-10 pr-20 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A69552]/40 focus:border-[#A69552] transition-all text-[#2F2F2B] dark:text-[#F5F5EF] placeholder-[#2F2F2B]/50 dark:placeholder-[#F5F5EF]/50 font-medium"
              />
              <button 
                onClick={() => applyPreset('The quick brown fox jumps over the lazy dog')} 
                className="absolute right-2 px-2 py-1 text-[11px] font-semibold text-[#2F2F2B]/70 hover:text-[#2F2F2B] dark:text-[#F5F5EF]/70 dark:hover:text-white bg-[#E9E8B1]/40 dark:bg-[#2F2F2B] rounded-md transition-colors font-sans cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="lg:col-span-3 flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none font-sans text-xs tracking-tight">
              <button onClick={() => applyPreset('The quick brown fox jumps over the lazy dog')} className="whitespace-nowrap font-semibold px-2.5 py-2 rounded-lg bg-[#E9E8B1]/20 hover:bg-[#E9E8B1]/40 text-[#2F2F2B] dark:text-[#F5F5EF] transition-all border border-[#2F2F2B]/30 dark:border-transparent cursor-pointer">Pangram</button>
              <button onClick={() => applyPreset('ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789')} className="whitespace-nowrap font-semibold px-2.5 py-2 rounded-lg bg-[#E9E8B1]/20 hover:bg-[#E9E8B1]/40 text-[#2F2F2B] dark:text-[#F5F5EF] transition-all border border-[#2F2F2B]/30 dark:border-transparent cursor-pointer">Alphabet</button>
              <button onClick={() => applyPreset('0123456789 ()[]{}#$&%+-=*/@')} className="whitespace-nowrap font-semibold px-2.5 py-2 rounded-lg bg-[#E9E8B1]/20 hover:bg-[#E9E8B1]/40 text-[#2F2F2B] dark:text-[#F5F5EF] transition-all border border-[#2F2F2B]/30 dark:border-transparent cursor-pointer">Numerals</button>
            </div>

            <div className="lg:col-span-3 flex items-center gap-3 bg-[#E9E8B1]/20 dark:bg-[#1A1A17] border border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15 rounded-xl px-3.5 py-2">
              <span className="text-xs font-mono font-medium text-[#2F2F2B]/60 dark:text-[#F5F5EF]/60">Size</span>
              <input 
                type="range" 
                min="14" 
                max="72" 
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-1.5 bg-[#2F2F2B]/15 dark:bg-[#F5F5EF]/20 rounded-lg cursor-pointer"
                style={{ accentColor: '#9a8945' }}
              />
              <span className="text-xs font-mono font-bold w-9 text-right text-[#2F2F2B] dark:text-[#F5F5EF]">{fontSize}px</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15 text-xs text-[#2F2F2B]/80 dark:text-[#F5F5EF]/80 font-sans tracking-tight">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: 'all', label: `All (${fonts.length})` },
                { key: 'variable', label: `Variable (${fonts.filter(f => f.isVariable).length})` },
                { key: 'sans', label: `Sans (${fonts.filter(f => !f.isVariable && !f.family.toLowerCase().includes('mono') && !f.family.toLowerCase().includes('fira code') && !f.family.toLowerCase().includes('jetbrains') && !f.family.toLowerCase().includes('dejavu')).length})` },
                { key: 'mono', label: `Mono (${fonts.filter(f => f.family.toLowerCase().includes('mono') || f.family.toLowerCase().includes('fira code') || f.family.toLowerCase().includes('jetbrains') || f.family.toLowerCase().includes('dejavu')).length})` }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeCategory === key
                      ? 'font-bold bg-[#A69552] text-[#F5F5EF] dark:text-black'
                      : 'bg-transparent hover:bg-[#2F2F2B]/10 dark:hover:bg-[#2F2F2B] text-[#2F2F2B] dark:text-[#F5F5EF]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Font Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {filteredFonts.map((font) => {
          const isVariable = font.isVariable;
          const genericFallback = getFallbackGeneric(font.family);
          const distinctWeights = Array.from(new Set(font.files.map(f => f.weightMin))).sort((a, b) => a - b);
          
          const selectedWeights = selectedWeightsMap[font.family] || distinctWeights;
          const activePreviewWeight = activePreviewWeightMap[font.family] ?? (isVariable ? 400 : distinctWeights[0] || 400);
          const isItalic = italicMap[font.family] || false;
          const hasItalicFiles = font.files.some(f => f.style === 'italic');
          const currentStep = stepModeMap[font.family] || 100;

          const minW = Math.min(...font.files.map(f => f.weightMin));
          const maxW = Math.max(...font.files.map(f => f.weightMax));

          const css2Url = buildCss2Url(apiBase, font, selectedWeights, isItalic);
          const htmlSnippet = `<link href="${css2Url}" rel="stylesheet">`;
          const cssImportSnippet = `@import url('${css2Url}');`;
          const fontFamilySnippet = `font-family: '${font.family}', ${genericFallback};`;

          const targetId = `${font.family.replace(/\s+/g, '-').toLowerCase()}-target`;

          return (
            <article
              key={font.family}
              className="bg-[#F5F5EF] dark:bg-[#2F2F2B]/50 border border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15 hover:border-[#A69552] rounded-2xl p-6 md:p-7 shadow-sm transition-all duration-200 space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-2xl font-bold tracking-tight text-[#2F2F2B] dark:text-[#F5F5EF]">{font.family}</h2>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#A69552]/25 text-[#7A751A] dark:text-[#A69552] border border-[#A69552]/40">
                      {isVariable ? 'Variable Font' : `${font.files.length} Styles`}
                    </span>
                    <button
                      onClick={() => copyToClipboard(fontFamilySnippet, 'CSS font-family copied!')}
                      className="group flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-[#E9E8B1]/40 dark:bg-[#1A1A17] text-[#2F2F2B] dark:text-[#F5F5EF]/90 border border-[#2F2F2B]/20 dark:border-white/10 hover:border-[#A69552] transition-colors cursor-pointer"
                      title="Click to copy font-family rule"
                    >
                      <span>font-family: <strong>'{font.family}', {genericFallback}</strong></span>
                      <svg className="w-3 h-3 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Export Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto font-sans">
                  <button 
                    onClick={() => copyToClipboard(fontFamilySnippet, 'CSS font-family declaration copied!')}
                    className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#E9E8B1]/30 hover:bg-[#E9E8B1]/60 text-[#2F2F2B] dark:text-[#F5F5EF] transition-colors border border-[#2F2F2B]/20 dark:border-transparent cursor-pointer"
                  >
                    Copy CSS Rule
                  </button>
                  <button 
                    onClick={() => copyToClipboard(htmlSnippet, 'HTML <link> tag copied!')}
                    className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#E9E8B1]/20 hover:bg-[#E9E8B1]/40 text-[#2F2F2B] dark:text-[#F5F5EF] transition-colors border border-[#2F2F2B]/20 dark:border-transparent cursor-pointer"
                  >
                    Copy &lt;link&gt;
                  </button>
                  <button 
                    onClick={() => copyToClipboard(cssImportSnippet, '@import rule copied!')}
                    className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#A69552] hover:bg-[#A69552]/90 text-[#F5F5EF] dark:text-black transition-all shadow-sm cursor-pointer"
                  >
                    Copy @import
                  </button>
                </div>
              </div>

              {/* Weight & Style Selection Controls */}
              <div className="flex flex-wrap items-center gap-3 bg-[#E9E8B1]/20 dark:bg-[#1A1A17]/70 p-3.5 rounded-xl border border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15">
                <span className="text-xs font-mono font-bold text-[#2F2F2B]/70 dark:text-[#F5F5EF]/70 uppercase tracking-wider">
                  {isVariable ? 'Weight Axis:' : 'Configure Weights:'}
                </span>

                {isVariable ? (
                  <div className="flex-1 flex flex-wrap items-center gap-4 min-w-[280px]">
                    {/* Slider & Value Display */}
                    <div className="flex-1 flex items-center gap-3 min-w-[180px]">
                      <input 
                        type="range" 
                        min={minW}
                        max={maxW}
                        value={activePreviewWeight}
                        step={currentStep}
                        onChange={(e) => handleVariableSlider(font.family, Number(e.target.value))}
                        className="w-full h-1.5 bg-[#2F2F2B]/15 dark:bg-[#F5F5EF]/20 rounded-lg cursor-pointer"
                        style={{ accentColor: '#9a8945' }}
                      />
                      <span className="text-xs font-mono font-bold text-[#A69552] w-12 text-right">
                        {activePreviewWeight}
                      </span>
                    </div>

                    {/* Step / Snap Radio Group (1, 10, 100) */}
                    <div className="flex items-center gap-1 bg-[#E9E8B1]/40 dark:bg-[#2F2F2B] p-1 rounded-lg border border-[#2F2F2B]/10 dark:border-white/5 text-[11px] font-mono">
                      <span className="text-[10px] px-1.5 opacity-60 uppercase font-semibold">Snap:</span>
                      {([
                        { value: 1, label: '1' },
                        { value: 10, label: '10' },
                        { value: 100, label: '100' },
                      ] as const).map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setStepMode(font.family, value)}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            currentStep === value
                              ? 'bg-[#A69552] text-white dark:text-black shadow-xs'
                              : 'text-[#2F2F2B]/70 dark:text-[#F5F5EF]/70 hover:text-black dark:hover:text-white'
                          }`}
                          title={`Snap slider by ${value}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {distinctWeights.map((w) => {
                      const isSelected = selectedWeights.includes(w);
                      const isCurrentlyPreviewed = activePreviewWeight === w;

                      return (
                        <button
                          key={w}
                          onClick={() => toggleWeightSelection(font.family, w)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#A69552] text-white dark:text-black border-[#A69552]'
                              : 'bg-transparent text-[#2F2F2B]/60 dark:text-[#F5F5EF]/60 border-[#2F2F2B]/20 dark:border-white/10 hover:border-[#A69552]'
                          } ${isCurrentlyPreviewed ? 'ring-2 ring-offset-1 ring-[#A69552]' : ''}`}
                          title={`Click to toggle ${w} in URL`}
                        >
                          {w} {isSelected ? '✓' : ''}
                        </button>
                      );
                    })}

                    {distinctWeights.length > 1 && (
                      <button
                        onClick={() => toggleSelectAllWeights(font.family, distinctWeights)}
                        className="px-2 py-1 text-[10px] font-mono text-[#2F2F2B]/60 dark:text-[#F5F5EF]/60 hover:text-[#A69552] underline ml-1 cursor-pointer"
                      >
                        {distinctWeights.every(w => selectedWeights.includes(w)) ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                )}

                {hasItalicFiles && (
                  <button 
                    onClick={() => toggleItalicState(font.family)}
                    className={`ml-auto text-xs font-mono font-bold px-3 py-1 rounded-lg transition-colors border cursor-pointer ${
                      isItalic
                        ? 'bg-[#A69552] text-white dark:text-black border-[#A69552]'
                        : 'bg-transparent text-[#2F2F2B] dark:text-[#F5F5EF] border-[#2F2F2B]/20 dark:border-white/10 hover:border-[#A69552]'
                    }`}
                  >
                    Italic {isItalic ? '✓' : ''}
                  </button>
                )}
              </div>

              {/* Live Editable Preview */}
              <div className="py-4 overflow-x-auto min-h-[100px] flex items-center">
                <div 
                  id={targetId}
                  ref={(el) => {
                    if (el) {
                      previewTargetsRef.current.set(targetId, el);
                      if (el.innerText !== sampleText && el !== document.activeElement) {
                        el.innerText = sampleText;
                      }
                    } else {
                      previewTargetsRef.current.delete(targetId);
                    }
                  }}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  spellCheck={false}
                  className="w-full leading-tight tracking-tight focus:outline-none text-[#2F2F2B] dark:text-[#F5F5EF] cursor-text"
                  style={{
                    fontFamily: `'${font.family}', ${genericFallback}`,
                    fontWeight: activePreviewWeight,
                    fontStyle: isItalic ? 'italic' : 'normal',
                    fontSize: `${fontSize}px`,
                  }}
                  onInput={(e) => {
                    const text = e.currentTarget.innerText || '';
                    previewTargetsRef.current.forEach((target, id) => {
                      if (id !== targetId && target && target !== document.activeElement) {
target.innerText = text;
}
                    });
                    setSampleText(text);
                  }}
                />
              </div>

              {/* Dynamic URL String Preview */}
              <div className="pt-3 border-t border-[#2F2F2B]/15 dark:border-[#F5F5EF]/15 flex flex-col md:flex-row md:items-center justify-between text-xs font-mono text-[#2F2F2B]/75 dark:text-[#F5F5EF]/75 gap-2">
                <div className="truncate max-w-2xl">
                  <span className="opacity-50">Generated Link: </span>
                  <code className="text-[#86800E] dark:text-[#D9D24D] select-all">{css2Url}</code>
                </div>
                <div className="shrink-0 text-right opacity-60">
                  Previewing at: <strong>{activePreviewWeight}</strong> {isItalic ? '(italic)' : '(normal)'}
                </div>
              </div>
            </article>
          );
        })}

        {filteredFonts.length === 0 && (
          <div className="text-center opacity-60 py-24">
            <p className="text-lg font-bold mb-2">No fonts match this category</p>
            <p className="text-sm">Try selecting a different category or drop new fonts into <code className="font-mono">/public-fonts</code></p>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}} />
    </div>
  );
}