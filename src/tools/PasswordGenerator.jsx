import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, Check, RefreshCw, ShieldCheck, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { copyToClipboard } from '../utils/formatters';
import confetti from 'canvas-confetti';

const EFF_WORDS = [
  'acorn', 'almond', 'anchor', 'antler', 'apple', 'apron', 'armor', 'arrow', 'artist', 'atlas',
  'bacon', 'badge', 'badger', 'baker', 'bamboo', 'banner', 'beacon', 'beaver', 'beetle', 'bison',
  'blade', 'blanket', 'blazer', 'blizzard', 'bonfire', 'boulder', 'breeze', 'bridge', 'bronze',
  'cactus', 'camel', 'candle', 'canyon', 'canvas', 'carpet', 'castle', 'cedar', 'cherry', 'chimney',
  'cipher', 'clarity', 'clover', 'cobalt', 'comet', 'copper', 'coral', 'cosmos', 'crater', 'crystal',
  'dancer', 'dawn', 'desert', 'diamond', 'dolphin', 'dragon', 'drift', 'eagle', 'echo', 'ember',
  'falcon', 'feather', 'ferret', 'fjord', 'flame', 'flint', 'forest', 'fossil', 'galaxy', 'garnet',
  'glacier', 'granite', 'harbor', 'haven', 'hawk', 'horizon', 'icicle', 'island', 'jasper', 'jungle',
  'kayak', 'lagoon', 'lantern', 'leopard', 'lightning', 'lotus', 'lumber', 'magnet', 'mammoth', 'mantle',
  'meadow', 'meteor', 'mineral', 'monarch', 'mountain', 'nebula', 'nickel', 'oasis', 'ocean', 'olive',
  'onyx', 'orbit', 'orchid', 'panther', 'pebble', 'phoenix', 'pioneer', 'planet', 'portal', 'prism',
  'pyramid', 'quartz', 'radar', 'rainbow', 'ranger', 'ravine', 'reef', 'rhino', 'ripple', 'river',
  'ruby', 'safari', 'satellite', 'shadow', 'silver', 'solace', 'spark', 'sphinx', 'spirit', 'spring',
  'summit', 'sunburst', 'talisman', 'timber', 'topaz', 'torrent', 'tulip', 'tundra', 'typhoon', 'valley',
  'vapor', 'velvet', 'vortex', 'walrus', 'willow', 'windward', 'wizard', 'zenith', 'zephyr', 'zircon'
];

export default function PasswordGenerator() {
  const [mode, setMode] = useState('random'); // 'random' or 'passphrase'
  const [length, setLength] = useState(20);
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [batchList, setBatchList] = useState([]);

  // Generate cryptographically secure random integers
  const getCryptoRandomInt = (max) => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  };

  const generatePassword = () => {
    if (mode === 'passphrase') {
      const words = [];
      for (let i = 0; i < wordCount; i++) {
        const idx = getCryptoRandomInt(EFF_WORDS.length);
        words.push(EFF_WORDS[idx]);
      }
      const pass = words.join(separator);
      setPassword(pass);
      return pass;
    }

    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeAmbiguous) {
      upper = upper.replace(/[IO]/g, '');
      lower = lower.replace(/[lo]/g, '');
      numbers = numbers.replace(/[01]/g, '');
    }

    let pool = '';
    const guaranteed = [];

    if (useUpper) {
      pool += upper;
      guaranteed.push(upper[getCryptoRandomInt(upper.length)]);
    }
    if (useLower) {
      pool += lower;
      guaranteed.push(lower[getCryptoRandomInt(lower.length)]);
    }
    if (useNumbers) {
      pool += numbers;
      guaranteed.push(numbers[getCryptoRandomInt(numbers.length)]);
    }
    if (useSymbols) {
      pool += symbols;
      guaranteed.push(symbols[getCryptoRandomInt(symbols.length)]);
    }

    if (!pool) {
      pool = lower;
      guaranteed.push(lower[getCryptoRandomInt(lower.length)]);
    }

    const passChars = [...guaranteed];
    for (let i = passChars.length; i < length; i++) {
      passChars.push(pool[getCryptoRandomInt(pool.length)]);
    }

    // Fisher-Yates cryptographically secure shuffle
    for (let i = passChars.length - 1; i > 0; i--) {
      const j = getCryptoRandomInt(i + 1);
      [passChars[i], passChars[j]] = [passChars[j], passChars[i]];
    }

    const res = passChars.join('');
    setPassword(res);
    return res;
  };

  const generateBatch = () => {
    const list = [];
    for (let i = 0; i < batchCount; i++) {
      list.push(generatePassword());
    }
    setBatchList(list);
  };

  useEffect(() => {
    generatePassword();
  }, [mode, length, wordCount, separator, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  const handleCopy = (textToCopy = password) => {
    copyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate Entropy (bits)
  const calculateEntropy = () => {
    if (mode === 'passphrase') {
      return Math.round(wordCount * Math.log2(EFF_WORDS.length));
    }
    let poolSize = 0;
    if (useUpper) poolSize += 26;
    if (useLower) poolSize += 26;
    if (useNumbers) poolSize += 10;
    if (useSymbols) poolSize += 26;
    if (poolSize === 0) return 0;
    return Math.round(length * Math.log2(poolSize));
  };

  const entropy = calculateEntropy();

  const getStrengthMeta = () => {
    if (entropy < 45) return { label: 'Weak', color: 'text-rose-500', bg: 'bg-rose-500', crack: 'Minutes' };
    if (entropy < 65) return { label: 'Reasonable', color: 'text-amber-500', bg: 'bg-amber-500', crack: 'Years' };
    if (entropy < 85) return { label: 'Strong', color: 'text-brand-500', bg: 'bg-brand-500', crack: 'Centuries' };
    return { label: 'Ultra Secure', color: 'text-emerald-500', bg: 'bg-emerald-500', crack: 'Trillions of Years' };
  };

  const strength = getStrengthMeta();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Generated Display Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden">
        
        {/* Strength meter bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full ${strength.bg} transition-all duration-500`}
            style={{ width: `${Math.min(100, (entropy / 100) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 mt-1">
          <div className="font-mono text-lg sm:text-2xl font-bold tracking-wider text-slate-900 dark:text-white break-all select-all">
            {password || 'Select at least one set'}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => generatePassword()}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Generate new password"
            >
              <RefreshCw className="w-5 h-5 hover:rotate-180 transition-transform duration-500" />
            </button>

            <button
              onClick={() => handleCopy()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Entropy indicator */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${strength.color}`} />
            <span className="font-semibold text-slate-700 dark:text-slate-200">{strength.label}</span>
            <span>({entropy} bits entropy)</span>
          </div>
          <div>
            <span>Estimated brute force crack time: </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{strength.crack}</span>
          </div>
        </div>

      </div>

      {/* Settings Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Mode Selector */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            onClick={() => setMode('random')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'random'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Random Characters
          </button>
          <button
            onClick={() => setMode('passphrase')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'passphrase'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Memorable Passphrase
          </button>
        </div>

        {mode === 'random' ? (
          <>
            {/* Length Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Password Length</span>
                <span className="font-mono text-brand-600 dark:text-brand-400 text-sm">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Uppercase Letters (A-Z)', state: useUpper, set: setUseUpper },
                { label: 'Lowercase Letters (a-z)', state: useLower, set: setUseLower },
                { label: 'Numbers (0-9)', state: useNumbers, set: setUseNumbers },
                { label: 'Special Symbols (!@#$...)', state: useSymbols, set: setUseSymbols },
                { label: 'Exclude Ambiguous (l, 1, O, 0)', state: excludeAmbiguous, set: setExcludeAmbiguous },
              ].map((opt) => (
                <label
                  key={opt.label}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={opt.state}
                    onChange={(e) => opt.set(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </>
        ) : (
          /* Passphrase Mode */
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Number of Words</span>
                <span className="font-mono text-brand-600 dark:text-brand-400 text-sm">{wordCount}</span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Word Separator</span>
              <div className="flex items-center gap-1.5">
                {['-', '_', '.', ' ', '#'].map((sep) => (
                  <button
                    key={sep}
                    onClick={() => setSeparator(sep)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                      separator === sep
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {sep === ' ' ? '␣' : sep}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
