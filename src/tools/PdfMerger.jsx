import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileText, Upload, Download, Trash2, ArrowUp, ArrowDown, RefreshCw, CheckCircle, Layers } from 'lucide-react';
import { formatBytes, downloadBlob } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function PdfMerger() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newEntries = [];
    for (const file of files) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        continue;
      }
      try {
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageCount = doc.getPageCount();

        newEntries.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          buffer,
          name: file.name,
          size: file.size,
          pages: pageCount,
        });
      } catch (err) {
        console.error('Error reading PDF:', err);
        setError(`Failed to read "${file.name}". Ensure it is a valid, unencrypted PDF.`);
      }
    }

    setPdfFiles((prev) => [...prev, ...newEntries]);
  };

  const movePdf = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= pdfFiles.length) return;
    const updated = [...pdfFiles];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setPdfFiles(updated);
  };

  const removePdf = (index) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) return;
    setIsMerging(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfFiles) {
        const doc = await PDFDocument.load(item.buffer);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'omnitool-merged.pdf');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      console.error('Merge error:', err);
      setError('An error occurred while merging PDFs: ' + err.message);
    } finally {
      setIsMerging(false);
    }
  };

  const totalPages = pdfFiles.reduce((acc, curr) => acc + curr.pages, 0);
  const totalSize = pdfFiles.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="space-y-6">
      
      {/* Upload Zone */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group">
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-3">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Upload PDFs to Merge
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Select two or more PDF files. Processed 100% locally in your browser memory via pdf-lib. Zero server uploads.
        </p>
      </label>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {pdfFiles.length > 0 && (
        <div className="space-y-4">
          
          {/* Summary Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <span className="font-bold text-slate-900 dark:text-white">
                {pdfFiles.length} {pdfFiles.length === 1 ? 'Document' : 'Documents'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-300">
                {totalPages} Total Pages
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-mono text-xs">
                {formatBytes(totalSize)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPdfFiles([])}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear All
              </button>

              <button
                onClick={handleMerge}
                disabled={pdfFiles.length < 2 || isMerging}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
              >
                {isMerging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Merging PDFs...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Merge & Download</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-2.5">
            {pdfFiles.map((pdf, idx) => (
              <div
                key={pdf.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {pdf.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                        {pdf.pages} {pdf.pages === 1 ? 'page' : 'pages'}
                      </span>
                      <span>{formatBytes(pdf.size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => movePdf(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => movePdf(idx, 1)}
                    disabled={idx === pdfFiles.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => removePdf(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center pt-2">
            Use the arrows to rearrange the order before merging.
          </p>

        </div>
      )}

    </div>
  );
}
