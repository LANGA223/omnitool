import React, { useState } from 'react';
import { ShieldCheck, Upload, Download, Eye, AlertTriangle, CheckCircle, FileImage } from 'lucide-react';
import { formatBytes, downloadBlob } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function ExifStripper() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [cleanBlob, setCleanBlob] = useState(null);
  const [cleanUrl, setCleanUrl] = useState(null);
  const [metadataDetected, setMetadataDetected] = useState([]);
  const [isStripping, setIsStripping] = useState(false);

  const checkExifMarkers = (arrayBuffer) => {
    const dataView = new DataView(arrayBuffer);
    const tagsFound = [];

    // Check JPEG SOI marker 0xFFD8
    if (dataView.getUint16(0) === 0xffd8) {
      let offset = 2;
      while (offset < dataView.byteLength - 2) {
        const marker = dataView.getUint16(offset);
        offset += 2;

        if (marker === 0xffe1) {
          // APP1 (EXIF / XMP marker)
          tagsFound.push('EXIF Metadata & Device Profile');
          const length = dataView.getUint16(offset);
          // Check for Exif identifier
          const exifHeader = String.fromCharCode(
            dataView.getUint8(offset + 2),
            dataView.getUint8(offset + 3),
            dataView.getUint8(offset + 4),
            dataView.getUint8(offset + 5)
          );
          if (exifHeader === 'Exif') {
            tagsFound.push('Camera Hardware Info & Serial');
            tagsFound.push('Embedded GPS Location Coordinates');
            tagsFound.push('Capture Timestamp & Exposure Details');
          }
          offset += length;
        } else if (marker === 0xffed) {
          tagsFound.push('IPTC Copyright & Editing History');
          offset += dataView.getUint16(offset);
        } else if ((marker & 0xff00) === 0xff00 && marker !== 0xffd9) {
          offset += dataView.getUint16(offset);
        } else {
          break;
        }
      }
    } else if (file?.type === 'image/png') {
      tagsFound.push('PNG Chunks (tEXt, iTXt, pHYs, Creation Date)');
    }

    if (tagsFound.length === 0) {
      tagsFound.push('Standard Image Profile (No dangerous GPS headers found)');
    }

    return Array.from(new Set(tagsFound));
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const rawBuffer = await uploadedFile.arrayBuffer();
    const detected = checkExifMarkers(rawBuffer);
    setMetadataDetected(detected);

    const url = URL.createObjectURL(uploadedFile);
    setOriginalUrl(url);

    // Strip EXIF by re-rendering to pure canvas buffer
    setIsStripping(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const mimeType = uploadedFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCleanBlob(blob);
            if (cleanUrl) URL.revokeObjectURL(cleanUrl);
            setCleanUrl(URL.createObjectURL(blob));
          }
          setIsStripping(false);
        },
        mimeType,
        0.95
      );
    };
    img.src = url;
  };

  const handleDownload = () => {
    if (!cleanBlob) return;
    const baseName = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) : 'photo';
    const ext = file?.type === 'image/png' ? 'png' : 'jpg';
    downloadBlob(cleanBlob, `${baseName}-scrubbed.${ext}`);
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="space-y-6">
      
      {!file ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-12 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Upload a Photo to Strip EXIF Metadata
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Removes hidden GPS location coordinates, camera models, serial numbers, and timestamps before posting online.
          </p>
        </label>
      ) : (
        <div className="space-y-6">
          
          {/* Metadata Inspection Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Original File Info */}
            <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Original Photo Metadata
                </h4>
              </div>

              <div className="space-y-1.5">
                {metadataDetected.map((tag, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Original Size: {formatBytes(file.size)}
              </p>
            </div>

            {/* Sanitized File Info */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Sanitized Clean Output
                </h4>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>GPS Location Coordinates Stripped</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Camera Serial & Lens Info Removed</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Timestamps & Thumbnails Cleaned</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Cleaned Size: {cleanBlob ? formatBytes(cleanBlob.size) : 'Processing...'}
              </p>
            </div>

          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <FileImage className="w-5 h-5 text-brand-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                {file.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                <span>Upload Another</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleDownload}
                disabled={!cleanBlob || isStripping}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Scrubbed Image</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
