import React, { useState } from 'react';
import { Type, Copy, Check, Sparkles, RefreshCw, Trash2, ArrowDownUp } from 'lucide-react';
import { copyToClipboard } from '../utils/formatters';

export default function TextTools() {
  const [text, setText] = useState(`OmniTool is an all-in-one browser toolbox where every single operation runs locally on your machine via JavaScript, HTML5 Canvas, and Web Crypto.

No server uploads, zero logins, and complete offline privacy!`);
  const [copied, setCopied] = useState(false);

  // Statistics
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0;
  const readingTimeMins = Math.ceil(words / 200);
  const speakingTimeMins = Math.ceil(words / 130);

  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Case transforms
  const transform = (fn) => {
    setText(fn(text));
  };

  const toCamelCase = (str) =>
    str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');

  const toPascalCase = (str) =>
    str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');

  const toSnakeCase = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[\s\W-]+/g, '_');

  const toKebabCase = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[\s\W_]+/g, '-');

  const toTitleCase = (str) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  const toConstantCase = (str) =>
    str
      .trim()
      .toUpperCase()
      .replace(/[\s\W-]+/g, '_');

  // Text utilities
  const cleanSpaces = () => setText(text.replace(/[ \t]+/g, ' ').trim());
  const removeEmptyLines = () =>
    setText(
      text
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .join('\n')
    );
  const sortLinesAsc = () => setText(text.split('\n').sort().join('\n'));
  const sortLinesDesc = () => setText(text.split('\n').sort().reverse().join('\n'));
  const deduplicateLines = () => setText(Array.from(new Set(text.split('\n'))).join('\n'));

  // Encode / Decode
  const encodeUrl = () => setText(encodeURIComponent(text));
  const decodeUrl = () => {
    try {
      setText(decodeURIComponent(text));
    } catch {
      alert('Invalid URL encoding');
    }
  };
  const encodeBase64 = () => setText(btoa(unescape(encodeURIComponent(text))));
  const decodeBase64 = () => {
    try {
      setText(decodeURIComponent(escape(atob(text))));
    } catch {
      alert('Invalid Base64 string');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Real-time stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Words', val: words },
          { label: 'Characters', val: charCount },
          { label: 'No Spaces', val: charNoSpaces },
          { label: 'Sentences', val: sentences },
          { label: 'Paragraphs', val: paragraphs },
          { label: 'Reading Time', val: `~${readingTimeMins} min` },
        ].map((s) => (
          <div
            key={s.label}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm"
          >
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{s.label}</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">{s.val}</span>
          </div>
        ))}
      </div>

      {/* Editor & Actions */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-brand-500" />
            <span>Text Editor & Formatter</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setText('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste or write your text here..."
          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all leading-relaxed"
        />

        {/* Transformation Action Buttons */}
        <div className="space-y-3 pt-2">
          
          {/* Case Convert */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Case Conversions
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'UPPERCASE', fn: (s) => s.toUpperCase() },
                { label: 'lowercase', fn: (s) => s.toLowerCase() },
                { label: 'Title Case', fn: toTitleCase },
                { label: 'camelCase', fn: toCamelCase },
                { label: 'snake_case', fn: toSnakeCase },
                { label: 'kebab-case', fn: toKebabCase },
                { label: 'PascalCase', fn: toPascalCase },
                { label: 'CONSTANT_CASE', fn: toConstantCase },
              ].map((c) => (
                <button
                  key={c.label}
                  onClick={() => transform(c.fn)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean & Sort */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Cleaning & Organization
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={cleanSpaces}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Clean Extra Spaces
              </button>
              <button
                onClick={removeEmptyLines}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Remove Blank Lines
              </button>
              <button
                onClick={deduplicateLines}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Remove Duplicate Lines
              </button>
              <button
                onClick={sortLinesAsc}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Sort A ➔ Z
              </button>
              <button
                onClick={sortLinesDesc}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Sort Z ➔ A
              </button>
            </div>
          </div>

          {/* Encoders */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Encoding & Security
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={encodeBase64}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
              >
                Base64 Encode
              </button>
              <button
                onClick={decodeBase64}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
              >
                Base64 Decode
              </button>
              <button
                onClick={encodeUrl}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
              >
                URL Encode
              </button>
              <button
                onClick={decodeUrl}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
              >
                URL Decode
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
