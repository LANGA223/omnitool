import React, { useState, useEffect } from 'react';
import { Hash, Copy, Check, Upload, CheckCircle2, XCircle, FileCode, Sliders } from 'lucide-react';
import { copyToClipboard, formatBytes } from '../utils/formatters';

// Fast client-side MD5 algorithm
function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else return lResult ^ lX8 ^ lY8;
  }
  function F(x, y, z) { return (x & y) | (~x & z); }
  function G(x, y, z) { return (x & z) | (y & ~z); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | ~z); }
  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWordsTemp1 = lMessageLength + 8;
    const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    const lWordArray = new Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue) {
    let WordToHexValue = '', WordToHexValueTemp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValueTemp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
  }
  const x = convertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

export default function HashCalculator() {
  const [sourceType, setSourceType] = useState('text'); // 'text' or 'file'
  const [inputText, setInputText] = useState('OmniTool: 100% Client-Side Privacy Toolbox');
  const [file, setFile] = useState(null);
  const [expectedHash, setExpectedHash] = useState('');
  
  const [hashes, setHashes] = useState({
    'SHA-256': '',
    'SHA-512': '',
    'SHA-1': '',
    'MD5': '',
  });
  const [copiedKey, setCopiedKey] = useState(null);

  const calculateHashes = async (buffer, textFallback = '') => {
    try {
      const bufferToHash = buffer || new TextEncoder().encode(textFallback);

      const [sha256Buf, sha512Buf, sha1Buf] = await Promise.all([
        window.crypto.subtle.digest('SHA-256', bufferToHash),
        window.crypto.subtle.digest('SHA-512', bufferToHash),
        window.crypto.subtle.digest('SHA-1', bufferToHash),
      ]);

      const bufferToHex = (b) =>
        Array.from(new Uint8Array(b))
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');

      // MD5 from string or binary
      let md5Hash = '';
      if (textFallback) {
        md5Hash = md5(textFallback);
      } else {
        const binStr = Array.from(new Uint8Array(bufferToHash))
          .map((b) => String.fromCharCode(b))
          .join('');
        md5Hash = md5(binStr);
      }

      setHashes({
        'SHA-256': bufferToHex(sha256Buf),
        'SHA-512': bufferToHex(sha512Buf),
        'SHA-1': bufferToHex(sha1Buf),
        'MD5': md5Hash,
      });
    } catch (err) {
      console.error('Hash calculation error:', err);
    }
  };

  useEffect(() => {
    if (sourceType === 'text') {
      calculateHashes(null, inputText);
    }
  }, [sourceType, inputText]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    const buffer = await uploadedFile.arrayBuffer();
    calculateHashes(buffer, '');
  };

  const handleCopy = (key, val) => {
    copyToClipboard(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanExpected = expectedHash.trim().toLowerCase();
  const matchedAlgorithm = cleanExpected
    ? Object.entries(hashes).find(([_, hash]) => hash.toLowerCase() === cleanExpected)?.[0]
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Mode Switcher */}
      <div className="flex p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setSourceType('text')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            sourceType === 'text'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Plain Text Input
        </button>
        <button
          onClick={() => setSourceType('file')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            sourceType === 'file'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          File Checksum (Any File Size)
        </button>
      </div>

      {/* Input Area */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {sourceType === 'text' ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Text to Hash
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              placeholder="Type string to compute checksums live..."
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        ) : (
          <div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
              <input type="file" onChange={handleFileUpload} className="hidden" />
              <Upload className="w-6 h-6 text-brand-500 mb-2" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Select or drop any file to compute checksum'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {file ? `${formatBytes(file.size)} • Processed 100% in browser memory` : 'Images, ISOs, binaries, zip archives'}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Checksum Verifier Matcher */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Verify Against Expected Checksum (Optional)
        </label>
        <div className="relative">
          <input
            type="text"
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            placeholder="Paste SHA256 / MD5 hash from official download page to verify..."
            className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {cleanExpected && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold">
              {matchedAlgorithm ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matches {matchedAlgorithm}!</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500">
                  <XCircle className="w-4 h-4" />
                  <span>No Match</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hash Results List */}
      <div className="space-y-3">
        {Object.entries(hashes).map(([algo, hashVal]) => {
          const isMatched = cleanExpected && hashVal.toLowerCase() === cleanExpected;
          return (
            <div
              key={algo}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                isMatched
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {algo}
                  </span>
                  {isMatched && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      MATCH VERIFIED
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(algo, hashVal)}
                  disabled={!hashVal}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {copiedKey === algo ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </span>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 font-mono text-xs text-slate-700 dark:text-slate-300 break-all select-all">
                {hashVal || 'Computing...'}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
