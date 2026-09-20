import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, Sliders, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { formatBytes, downloadBlob } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState(null);
  
  const [format, setFormat] = useState('image/webp');
  const [quality, setQuality] = useState(0.8);
  const [scale, setScale] = useState(1);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  const [compressedDimensions, setCompressedDimensions] = useState({ w: 0, h: 0 });
  
  const [isCompressing, setIsCompressing] = useState(false);
  const imageElementRef = useRef(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      imageElementRef.current = img;
      setOriginalDimensions({ w: img.width, h: img.height });
      compressImage(img, format, quality, scale);
    };
    img.src = url;
  };

  const compressImage = (img, mimeType, q, s) => {
    if (!img) return;
    setIsCompressing(true);

    const canvas = document.createElement('canvas');
    const targetW = Math.round(img.width * s);
    const targetH = Math.round(img.height * s);
    canvas.width = targetW;
    canvas.height = targetH;
    setCompressedDimensions({ w: targetW, h: targetH });

    const ctx = canvas.getContext('2d');
    // If output is JPEG and image has transparency, fill white background
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);
    }
    ctx.drawImage(img, 0, 0, targetW, targetH);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCompressedBlob(blob);
          if (compressedUrl) URL.revokeObjectURL(compressedUrl);
          setCompressedUrl(URL.createObjectURL(blob));
        }
        setIsCompressing(false);
      },
      mimeType,
      q
    );
  };

  useEffect(() => {
    if (imageElementRef.current) {
      compressImage(imageElementRef.current, format, quality, scale);
    }
  }, [format, quality, scale]);

  const handleDownload = () => {
    if (!compressedBlob) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const baseName = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) : 'image';
    downloadBlob(compressedBlob, `${baseName}-compressed.${ext}`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const originalSize = file ? file.size : 0;
  const compressedSize = compressedBlob ? compressedBlob.size : 0;
  const savings = originalSize > 0 && compressedSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {!file ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-12 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-3">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Select an image to compress
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports JPG, PNG, WebP, GIF, SVG. Everything runs locally in browser.
          </p>
        </label>
      ) : (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Format Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'WebP', mime: 'image/webp', note: 'Best ratio' },
                  { label: 'JPG', mime: 'image/jpeg', note: 'Standard' },
                  { label: 'PNG', mime: 'image/png', note: 'Lossless' },
                ].map((fmt) => (
                  <button
                    key={fmt.mime}
                    onClick={() => setFormat(fmt.mime)}
                    className={`p-2 rounded-xl text-center transition-all ${
                      format === fmt.mime
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{fmt.label}</div>
                    <div className="text-[10px] opacity-80">{fmt.note}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for lossy formats) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Quality Level</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                disabled={format === 'image/png'}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer disabled:opacity-40"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {format === 'image/png' ? 'PNG is lossless (quality slider disabled)' : '80% delivers visually lossless compression'}
              </p>
            </div>

            {/* Dimension Scale */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Resolution Scale</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.25"
                max="1.0"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {compressedDimensions.w} × {compressedDimensions.h} px
              </p>
            </div>

          </div>

          {/* Stats & Comparison Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Original Size</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatBytes(originalSize)}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Compressed Size</span>
                <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">
                  {isCompressing ? 'Calculating...' : formatBytes(compressedSize)}
                </span>
              </div>

              {savings > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  -{savings}% Smaller
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <span>Upload New</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleDownload}
                disabled={!compressedBlob || isCompressing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {format.split('/')[1].toUpperCase()}</span>
              </button>
            </div>

          </div>

          {/* Visual Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                <span>Original ({originalDimensions.w}×{originalDimensions.h}px)</span>
                <span className="font-mono">{formatBytes(originalSize)}</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-checkers p-2 flex items-center justify-center min-h-[260px] max-h-[380px]">
                <img src={originalUrl} alt="Original" className="max-h-[360px] object-contain rounded" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                <span>Compressed Preview ({compressedDimensions.w}×{compressedDimensions.h}px)</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">{formatBytes(compressedSize)}</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-checkers p-2 flex items-center justify-center min-h-[260px] max-h-[380px]">
                {compressedUrl && (
                  <img src={compressedUrl} alt="Compressed" className="max-h-[360px] object-contain rounded" />
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
