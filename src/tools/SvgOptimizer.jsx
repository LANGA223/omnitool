import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Copy, Check, Upload, ArrowRight, Eye, Code } from 'lucide-react';
import { copyToClipboard, downloadBlob, formatBytes } from '../utils/formatters';
import confetti from 'canvas-confetti';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="128" height="128" viewBox="0 0 128 128" version="1.1">
  <!-- Generator: Adobe Illustrator 28.0, SVG Export Plug-In -->
  <metadata id="metadata1">
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <cc:Work xmlns:cc="http://creativecommons.org/ns#">
        <dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <sodipodi:namedview id="namedview1" pagecolor="#ffffff" bordercolor="#000000" />
  <circle cx="64.0000" cy="64.0000" r="50.0000" fill="#0ea5e9" inkscape:label="circle" />
  <polygon points="64.0000,34.0000 78.0000,74.0000 44.0000,48.0000 84.0000,48.0000 50.0000,74.0000" fill="#ffffff" />
</svg>`;

export default function SvgOptimizer() {
  const [svgInput, setSvgInput] = useState(SAMPLE_SVG);
  const [svgOutput, setSvgOutput] = useState('');
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'code'
  const [copied, setCopied] = useState(false);

  // Optimizer algorithm
  const optimizeSvg = (svgText) => {
    if (!svgText.trim()) return '';

    let cleaned = svgText;

    // 1. Remove XML declaration and DOCTYPE
    cleaned = cleaned.replace(/<\?xml[^>]*\?>/gi, '');
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');

    // 2. Remove XML and HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // 3. Remove <metadata> and <sodipodi:namedview> blocks
    cleaned = cleaned.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    cleaned = cleaned.replace(/<sodipodi:namedview[\s\S]*?\/>/gi, '');
    cleaned = cleaned.replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/gi, '');

    // 4. Remove editor namespace declarations
    cleaned = cleaned.replace(/xmlns:inkscape="[^"]*"/gi, '');
    cleaned = cleaned.replace(/xmlns:sodipodi="[^"]*"/gi, '');
    cleaned = cleaned.replace(/xmlns:illustrator="[^"]*"/gi, '');
    cleaned = cleaned.replace(/xmlns:sketch="[^"]*"/gi, '');
    cleaned = cleaned.replace(/xmlns:figma="[^"]*"/gi, '');

    // 5. Remove editor-specific attributes (inkscape:*, sodipodi:*, data-name, etc.)
    cleaned = cleaned.replace(/\s+(inkscape|sodipodi|illustrator|sketch):[a-zA-Z0-9_-]+="[^"]*"/gi, '');

    // 6. Round floating point numbers in attributes
    cleaned = cleaned.replace(/="([0-9]+\.[0-9]{2,})"/g, (match, num) => {
      return `="${parseFloat(parseFloat(num).toFixed(2))}"`;
    });

    // 7. Collapse unnecessary whitespace between tags
    cleaned = cleaned.replace(/>\s+</g, '><');
    cleaned = cleaned.replace(/\s{2,}/g, ' ');

    return cleaned.trim();
  };

  useEffect(() => {
    setSvgOutput(optimizeSvg(svgInput));
  }, [svgInput]);

  const originalSize = new Blob([svgInput]).size;
  const optimizedSize = new Blob([svgOutput]).size;
  const savings = originalSize > 0 ? Math.round(((originalSize - optimizedSize) / originalSize) * 100) : 0;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setSvgInput(event.target.result);
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    downloadBlob(blob, 'omnitool-optimized.svg');
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleCopy = () => {
    if (!svgOutput) return;
    copyToClipboard(svgOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-[11px]">Original Size</span>
            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{formatBytes(originalSize)}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-slate-400 block text-[11px]">Cleaned Size</span>
            <span className="font-bold font-mono text-brand-600 dark:text-brand-400">{formatBytes(optimizedSize)}</span>
          </div>

          {savings > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              -{savings}% Smaller
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload SVG</span>
            <input type="file" accept=".svg" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleCopy}
            disabled={!svgOutput}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!svgOutput}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>
        </div>

      </div>

      {/* Grid: Input Source vs Optimized Output Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Source SVG */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <span>Original SVG Markup</span>
            <span className="font-mono text-slate-400">{formatBytes(originalSize)}</span>
          </div>
          <textarea
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            rows={14}
            className="w-full flex-1 p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
          />
        </div>

        {/* Output Side */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Rendered View</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Minified Code</span>
              </button>
            </div>

            <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">
              {formatBytes(optimizedSize)}
            </span>
          </div>

          {activeTab === 'preview' ? (
            <div className="flex-1 rounded-xl bg-checkers p-6 flex items-center justify-center min-h-[300px] border border-slate-200 dark:border-slate-800">
              {svgOutput ? (
                <div
                  className="max-w-[240px] max-h-[240px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full drop-shadow-md"
                  dangerouslySetInnerHTML={{ __html: svgOutput }}
                />
              ) : (
                <p className="text-xs text-slate-400">Invalid SVG markup</p>
              )}
            </div>
          ) : (
            <textarea
              readOnly
              value={svgOutput}
              rows={14}
              className="w-full flex-1 p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-y"
            />
          )}

        </div>

      </div>

    </div>
  );
}
