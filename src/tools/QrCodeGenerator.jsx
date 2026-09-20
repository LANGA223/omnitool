import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, Palette, Sliders, Sparkles } from 'lucide-react';
import { copyToClipboard, downloadBlob, downloadDataUrl } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function QrCodeGenerator() {
  const [text, setText] = useState('https://github.com/LANGA223/omnitool');
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [transparentBg, setTransparentBg] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [pngDataUrl, setPngDataUrl] = useState('');
  const [svgString, setSvgString] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setPngDataUrl('');
      setSvgString('');
      return;
    }

    const effectiveBg = transparentBg ? '#00000000' : bgColor;

    // Generate PNG
    QRCode.toDataURL(text, {
      width: size,
      margin: margin,
      color: {
        dark: fgColor,
        light: effectiveBg,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then((url) => setPngDataUrl(url))
      .catch((err) => console.error(err));

    // Generate SVG
    QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin: margin,
      color: {
        dark: fgColor,
        light: effectiveBg,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then((svg) => setSvgString(svg))
      .catch((err) => console.error(err));
  }, [text, fgColor, bgColor, transparentBg, errorCorrection, size, margin]);

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    downloadDataUrl(pngDataUrl, 'qrcode.png');
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    downloadBlob(blob, 'qrcode.svg');
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleCopy = async () => {
    if (!pngDataUrl) return;
    try {
      const res = await fetch(pngDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-5">
        
        {/* Content Input */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            QR Code Content (URL, Text, WiFi, Contact, Phone)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Type or paste text/URL here..."
            className="w-full p-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
          />

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: 'Website URL', val: 'https://example.com' },
              { label: 'WiFi Network', val: 'WIFI:T:WPA;S:HomeNetwork;P:SuperSecret123;;' },
              { label: 'Email Address', val: 'mailto:contact@example.com' },
              { label: 'SMS Message', val: 'SMSTO:+1234567890:Hello there!' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setText(preset.val)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Styling Options */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-brand-500" />
            <span>Appearance & Colors</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Foreground */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Foreground</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-500">{fgColor}</span>
              </div>
            </div>

            {/* Background */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Background</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer mr-1">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="rounded accent-brand-500 cursor-pointer"
                  />
                  <span>Alpha</span>
                </label>
                <input
                  type="color"
                  value={bgColor}
                  disabled={transparentBg}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent disabled:opacity-30"
                />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Resolution</span>
                <span>{size}px</span>
              </div>
              <input
                type="range"
                min="160"
                max="800"
                step="40"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Quiet Zone (Margin)</span>
                <span>{margin}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Error Correction</span>
                <span>{errorCorrection}</span>
              </div>
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value)}
                className="w-full p-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="L">L - Low (7%)</option>
                <option value="M">M - Medium (15%)</option>
                <option value="Q">Q - High (25%)</option>
                <option value="H">H - Best (30%)</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Preview Column */}
      <div className="lg:col-span-5 space-y-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Live QR Preview
          </h4>

          <div className="p-4 rounded-2xl bg-checkers border border-slate-200 dark:border-slate-700/60 shadow-inner flex items-center justify-center min-w-[260px] min-h-[260px]">
            {pngDataUrl ? (
              <img
                src={pngDataUrl}
                alt="Generated QR Code"
                className="max-w-[240px] max-h-[240px] object-contain rounded-lg shadow-md"
              />
            ) : (
              <p className="text-xs text-slate-400">Enter text to generate QR code</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-3 gap-2 mt-6">
            <button
              onClick={handleDownloadPng}
              disabled={!pngDataUrl}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              disabled={!svgString}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-600 hover:purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Vector SVG</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!pngDataUrl}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
            Vector SVG is infinite resolution and ideal for print brochures, stickers, and posters.
          </p>
        </div>
      </div>

    </div>
  );
}
