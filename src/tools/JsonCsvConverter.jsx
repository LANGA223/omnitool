import React, { useState } from 'react';
import { ArrowLeftRight, Download, Copy, Check, FileCode, Table, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { copyToClipboard, downloadBlob } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function JsonCsvConverter() {
  const [mode, setMode] = useState('json-to-csv'); // 'json-to-csv' or 'csv-to-json'
  const [inputData, setInputData] = useState(`[
  { "id": 1, "name": "Alice Johnson", "role": "Fullstack Engineer", "location": "Austin, TX", "skills": ["React", "Go", "TypeScript"] },
  { "id": 2, "name": "Bob Smith", "role": "Product Designer", "location": "New York, NY", "skills": ["Figma", "Design Systems"] },
  { "id": 3, "name": "Clara Davis", "role": "Security Specialist", "location": "Berlin, DE", "skills": ["Web Crypto", "Penetration Testing"] }
]`);
  const [delimiter, setDelimiter] = useState(',');
  const [outputData, setOutputData] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Helper to flatten nested object
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (Array.isArray(obj[k])) {
        acc[pre + k] = JSON.stringify(obj[k]);
      } else if (typeof obj[k] === 'object' && obj[k] !== null) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  const handleConvert = () => {
    setError(null);
    try {
      if (mode === 'json-to-csv') {
        const parsed = JSON.parse(inputData);
        const arrayData = Array.isArray(parsed) ? parsed : [parsed];

        if (arrayData.length === 0) {
          throw new Error('JSON array is empty.');
        }

        const flatArray = arrayData.map((item) => (typeof item === 'object' && item !== null ? flattenObject(item) : { value: item }));
        const headers = Array.from(new Set(flatArray.flatMap((item) => Object.keys(item))));

        const csvLines = [
          headers.join(delimiter),
          ...flatArray.map((row) =>
            headers
              .map((header) => {
                const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
                if (val.includes(delimiter) || val.includes('"') || val.includes('\n')) {
                  return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
              })
              .join(delimiter)
          ),
        ];

        const result = csvLines.join('\n');
        setOutputData(result);
        setParsedHeaders(headers);
        setParsedRows(flatArray);
      } else {
        // CSV to JSON
        const lines = inputData
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          throw new Error('CSV must contain at least a header row and one data row.');
        }

        const parseCsvLine = (line) => {
          const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
          const entries = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
            entries.push(val);
          }
          return entries;
        };

        const headers = parseCsvLine(lines[0]);
        const rows = lines.slice(1).map((line) => {
          const values = parseCsvLine(line);
          const obj = {};
          headers.forEach((h, idx) => {
            const raw = values[idx] ?? '';
            // Attempt to parse numbers/booleans/JSON
            if (!isNaN(raw) && raw.trim() !== '') {
              obj[h] = Number(raw);
            } else if (raw.toLowerCase() === 'true') {
              obj[h] = true;
            } else if (raw.toLowerCase() === 'false') {
              obj[h] = false;
            } else {
              try {
                obj[h] = JSON.parse(raw);
              } catch {
                obj[h] = raw;
              }
            }
          });
          return obj;
        });

        setOutputData(JSON.stringify(rows, null, 2));
        setParsedHeaders(headers);
        setParsedRows(rows);
      }
    } catch (err) {
      setError(err.message || 'Failed to parse data.');
      setOutputData('');
      setParsedRows([]);
      setParsedHeaders([]);
    }
  };

  React.useEffect(() => {
    handleConvert();
  }, [mode, delimiter, inputData]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputData(event.target.result);
      if (file.name.endsWith('.csv')) {
        setMode('csv-to-json');
      } else if (file.name.endsWith('.json')) {
        setMode('json-to-csv');
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!outputData) return;
    const isCsv = mode === 'json-to-csv';
    const blob = new Blob([outputData], { type: isCsv ? 'text/csv' : 'application/json' });
    downloadBlob(blob, isCsv ? 'omnitool-converted.csv' : 'omnitool-converted.json');
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleCopy = () => {
    if (!outputData) return;
    copyToClipboard(outputData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode(mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv');
              setInputData(outputData || inputData);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-brand-500" />
            <span>{mode === 'json-to-csv' ? 'JSON ➔ CSV' : 'CSV ➔ JSON'}</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer hover:bg-slate-50 transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import File</span>
            <input type="file" accept=".json,.csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Delimiter & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Delimiter:</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="&#9;">Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          <button
            onClick={handleCopy}
            disabled={!outputData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-40 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Output'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!outputData}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export {mode === 'json-to-csv' ? 'CSV' : 'JSON'}</span>
          </button>
        </div>

      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Input Pane */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            <span>Input ({mode === 'json-to-csv' ? 'JSON' : 'CSV'})</span>
            <span className="font-mono text-[11px]">{inputData.length} chars</span>
          </div>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            rows={12}
            className="w-full flex-1 p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
          />
        </div>

        {/* Output Pane */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            <span>Output ({mode === 'json-to-csv' ? 'CSV' : 'JSON'})</span>
            <span className="font-mono text-[11px]">{outputData.length} chars</span>
          </div>
          <textarea
            readOnly
            value={outputData}
            rows={12}
            className="w-full flex-1 p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-mono focus:outline-none resize-y"
          />
        </div>

      </div>

      {/* Interactive Table Preview */}
      {parsedRows.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-brand-500" />
              <span>Table Preview ({parsedRows.length} Rows, {parsedHeaders.length} Columns)</span>
            </h4>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {parsedHeaders.map((h) => (
                    <th key={h} className="p-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {parsedRows.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {parsedHeaders.map((h) => (
                      <td key={h} className="p-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {typeof row[h] === 'object' ? JSON.stringify(row[h]) : String(row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 50 && (
            <p className="text-[11px] text-slate-400 mt-2 text-right">
              Showing first 50 rows of {parsedRows.length}. Full data is included in export.
            </p>
          )}
        </div>
      )}

    </div>
  );
}
