import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Wand2, Eraser, Undo, Eye, ZoomIn, ZoomOut, Check, Sliders } from 'lucide-react';
import { downloadDataUrl } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function BackgroundRemover() {
  const [imageSrc, setImageSrc] = useState(null);
  const [tolerance, setTolerance] = useState(32);
  const [feather, setFeather] = useState(2);
  const [targetColor, setTargetColor] = useState({ r: 255, g: 255, b: 255 });
  const [activeTool, setActiveTool] = useState('wand'); // 'wand', 'eraser', 'restore'
  const [brushSize, setBrushSize] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showOriginal, setShowOriginal] = useState(false);

  const originalCanvasRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const isPaintingRef = useRef(false);

  // Load image onto canvases
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageSrc(event.target.result);

        const origCanvas = originalCanvasRef.current;
        const dispCanvas = displayCanvasRef.current;
        if (!origCanvas || !dispCanvas) return;

        origCanvas.width = img.width;
        origCanvas.height = img.height;
        dispCanvas.width = img.width;
        dispCanvas.height = img.height;

        const origCtx = origCanvas.getContext('2d', { willReadFrequently: true });
        const dispCtx = dispCanvas.getContext('2d', { willReadFrequently: true });

        origCtx.drawImage(img, 0, 0);
        dispCtx.drawImage(img, 0, 0);

        // Auto-sample top-left corner color as default background
        const pixel = origCtx.getImageData(0, 0, 1, 1).data;
        const sampled = { r: pixel[0], g: pixel[1], b: pixel[2] };
        setTargetColor(sampled);

        // Save initial state to history
        saveHistoryState(dispCtx, img.width, img.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const saveHistoryState = (ctx, w, h) => {
    const imgData = ctx.getImageData(0, 0, w, h);
    setHistory((prev) => [...prev.slice(-10), imgData]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // remove current
    const prevState = newHistory[newHistory.length - 1];
    setHistory(newHistory);

    const dispCanvas = displayCanvasRef.current;
    if (dispCanvas && prevState) {
      const ctx = dispCanvas.getContext('2d');
      ctx.putImageData(prevState, 0, 0);
    }
  };

  // Perform Chroma-Key / Color Tolerance background cutout
  const removeBackgroundColor = (r, g, b, tol, featherPx) => {
    const origCanvas = originalCanvasRef.current;
    const dispCanvas = displayCanvasRef.current;
    if (!origCanvas || !dispCanvas) return;

    setIsProcessing(true);
    setTimeout(() => {
      const w = origCanvas.width;
      const h = origCanvas.height;
      const origCtx = origCanvas.getContext('2d');
      const dispCtx = dispCanvas.getContext('2d');

      const srcData = origCtx.getImageData(0, 0, w, h);
      const dstData = dispCtx.createImageData(w, h);

      const src = srcData.data;
      const dst = dstData.data;
      const totalPixels = w * h;

      const tolSq = tol * tol * 3;
      const featherSq = (tol + featherPx * 5) * (tol + featherPx * 5) * 3;

      for (let i = 0; i < totalPixels * 4; i += 4) {
        const pr = src[i];
        const pg = src[i + 1];
        const pb = src[i + 2];
        const pa = src[i + 3];

        if (pa === 0) {
          dst[i + 3] = 0;
          continue;
        }

        const dr = pr - r;
        const dg = pg - g;
        const db = pb - b;
        const distSq = dr * dr + dg * dg + db * db;

        dst[i] = pr;
        dst[i + 1] = pg;
        dst[i + 2] = pb;

        if (distSq <= tolSq) {
          dst[i + 3] = 0; // Cutout completely
        } else if (distSq < featherSq && featherPx > 0) {
          // Feathered alpha transition
          const ratio = (distSq - tolSq) / (featherSq - tolSq);
          dst[i + 3] = Math.round(pa * Math.min(1, Math.max(0, ratio)));
        } else {
          dst[i + 3] = pa;
        }
      }

      dispCtx.putImageData(dstData, 0, 0);
      saveHistoryState(dispCtx, w, h);
      setIsProcessing(false);
    }, 20);
  };

  // Canvas Click / Mouse Interactions
  const getCanvasCoordinates = (e) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const handleCanvasMouseDown = (e) => {
    if (!imageSrc) return;
    const { x, y } = getCanvasCoordinates(e);

    if (activeTool === 'wand') {
      // Sample color under cursor and remove it
      const origCanvas = originalCanvasRef.current;
      const origCtx = origCanvas.getContext('2d');
      const pixel = origCtx.getImageData(x, y, 1, 1).data;
      const sampled = { r: pixel[0], g: pixel[1], b: pixel[2] };
      setTargetColor(sampled);
      removeBackgroundColor(sampled.r, sampled.g, sampled.b, tolerance, feather);
    } else {
      isPaintingRef.current = true;
      paintBrush(x, y);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isPaintingRef.current || activeTool === 'wand') return;
    const { x, y } = getCanvasCoordinates(e);
    paintBrush(x, y);
  };

  const handleCanvasMouseUp = () => {
    if (isPaintingRef.current) {
      isPaintingRef.current = false;
      const dispCanvas = displayCanvasRef.current;
      if (dispCanvas) {
        saveHistoryState(dispCanvas.getContext('2d'), dispCanvas.width, dispCanvas.height);
      }
    }
  };

  const paintBrush = (x, y) => {
    const dispCanvas = displayCanvasRef.current;
    const origCanvas = originalCanvasRef.current;
    if (!dispCanvas || !origCanvas) return;

    const ctx = dispCanvas.getContext('2d');
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (activeTool === 'restore') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(origCanvas, 0, 0);
      ctx.restore();
    }
  };

  const handleDownload = () => {
    const dispCanvas = displayCanvasRef.current;
    if (!dispCanvas) return;
    const dataUrl = dispCanvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, 'omnitool-transparent.png');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    const origCanvas = originalCanvasRef.current;
    const dispCanvas = displayCanvasRef.current;
    if (!origCanvas || !dispCanvas) return;
    const dispCtx = dispCanvas.getContext('2d');
    dispCtx.drawImage(origCanvas, 0, 0);
    saveHistoryState(dispCtx, dispCanvas.width, dispCanvas.height);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageSrc ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-12 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-3">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Upload an image to remove background
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            PNG, JPG, or WebP. Processed 100% locally on your machine via Canvas API.
          </p>
        </label>
      ) : (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Tool Selector */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTool('wand')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'wand'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Color Wand</span>
              </button>

              <button
                onClick={() => setActiveTool('eraser')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'eraser'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Manual Eraser</span>
              </button>

              <button
                onClick={() => setActiveTool('restore')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'restore'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Undo className="w-3.5 h-3.5" />
                <span>Restore Brush</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={history.length <= 1}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                title="Undo last action"
              >
                <Undo className="w-4 h-4" />
              </button>

              <button
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onMouseLeave={() => setShowOriginal(false)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Hold to view original"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reset to original"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <label className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Upload new image">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PNG</span>
              </button>
            </div>

          </div>

          {/* Tool Parameters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-xs">
            {activeTool === 'wand' ? (
              <>
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Tolerance Threshold</span>
                    <span>{tolerance}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={tolerance}
                    onChange={(e) => {
                      const tol = Number(e.target.value);
                      setTolerance(tol);
                      removeBackgroundColor(targetColor.r, targetColor.g, targetColor.b, tol, feather);
                    }}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Edge Softness / Feather</span>
                    <span>{feather}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={feather}
                    onChange={(e) => {
                      const f = Number(e.target.value);
                      setFeather(f);
                      removeBackgroundColor(targetColor.r, targetColor.g, targetColor.b, tolerance, f);
                    }}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Sampled Target:</span>
                  <div
                    className="w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-600 shadow-inner"
                    style={{ backgroundColor: `rgb(${targetColor.r},${targetColor.g},${targetColor.b})` }}
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Click anywhere on image to pick!
                  </span>
                </div>
              </>
            ) : (
              <div className="col-span-full flex items-center gap-4">
                <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  Brush Size: {brushSize}px
                </span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full max-w-md accent-brand-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Interactive Workspace Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-checkers p-4 flex items-center justify-center min-h-[420px] max-h-[600px]">
            {isProcessing && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-semibold flex items-center gap-2 shadow-xl">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                  <span>Cutting out background...</span>
                </div>
              </div>
            )}

            {/* Hidden Original Storage Canvas */}
            <canvas ref={originalCanvasRef} className="hidden" />

            {/* Display Canvas */}
            <canvas
              ref={displayCanvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className={`max-w-full max-h-[560px] object-contain cursor-crosshair rounded-lg shadow-lg ${
                showOriginal ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Original Preview Overlay when Eye button held */}
            {showOriginal && (
              <img
                src={imageSrc}
                alt="Original"
                className="absolute max-w-full max-h-[560px] object-contain rounded-lg shadow-lg pointer-events-none"
              />
            )}
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            💡 Tip: Click on any background area to sample its color and remove it automatically. Switch to Manual Eraser for precision touching.
          </p>

        </div>
      )}
    </div>
  );
}
