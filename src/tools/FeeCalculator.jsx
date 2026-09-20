import React, { useState } from 'react';
import { DollarSign, ArrowRightLeft, Copy, Check, Calculator, Info, Percent } from 'lucide-react';
import { copyToClipboard } from '../utils/formatters';

const PRESETS = [
  { id: 'stripe-us', name: 'Stripe (US Domestic)', percent: 2.9, fixed: 0.30, currency: '$' },
  { id: 'stripe-intl', name: 'Stripe (International)', percent: 4.4, fixed: 0.30, currency: '$' },
  { id: 'paypal-us', name: 'PayPal (US Standard)', percent: 3.49, fixed: 0.49, currency: '$' },
  { id: 'paypal-friends', name: 'PayPal (Friends & Family)', percent: 0, fixed: 0, currency: '$' },
  { id: 'upwork', name: 'Upwork Freelance Fee', percent: 10.0, fixed: 0.00, currency: '$' },
  { id: 'wise', name: 'Wise (Low Cost Transfer)', percent: 0.45, fixed: 0.50, currency: '$' },
  { id: 'custom', name: 'Custom Rate', percent: 3.0, fixed: 0.30, currency: '$' },
];

export default function FeeCalculator() {
  const [calculationType, setCalculationType] = useState('reverse'); // 'reverse' (invoice for X) or 'forward' (client pays X)
  const [amount, setAmount] = useState(1000);
  const [selectedPreset, setSelectedPreset] = useState('stripe-us');
  const [customPercent, setCustomPercent] = useState(2.9);
  const [customFixed, setCustomFixed] = useState(0.30);
  const [copied, setCopied] = useState(false);

  const preset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[0];
  const percentRate = selectedPreset === 'custom' ? customPercent : preset.percent;
  const fixedRate = selectedPreset === 'custom' ? customFixed : preset.fixed;

  let gross = 0;
  let fee = 0;
  let net = 0;

  const p = percentRate / 100;
  const f = fixedRate;

  if (calculationType === 'reverse') {
    // Want to receive 'amount' net
    // net = gross - (gross * p + f) => net = gross*(1 - p) - f => gross = (net + f) / (1 - p)
    if (p < 1) {
      gross = (amount + f) / (1 - p);
      fee = gross - amount;
      net = amount;
    }
  } else {
    // Client pays 'amount' gross
    gross = amount;
    fee = gross * p + f;
    net = Math.max(0, gross - fee);
  }

  const effectiveFeePercent = gross > 0 ? (fee / gross) * 100 : 0;

  const handleCopy = () => {
    const valToCopy = calculationType === 'reverse' ? gross.toFixed(2) : net.toFixed(2);
    copyToClipboard(valToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Calculation Direction Tabs */}
      <div className="flex p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setCalculationType('reverse')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            calculationType === 'reverse'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>I want to receive $X (How much to invoice?)</span>
        </button>
        <button
          onClick={() => setCalculationType('forward')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            calculationType === 'forward'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Client pays $X (How much will I keep?)</span>
        </button>
      </div>

      {/* Inputs and Gateway selector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Config */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {calculationType === 'reverse' ? 'Target Payout Amount ($)' : 'Invoice Amount Charged ($)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-2.5 text-base font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Payment Gateway / Processor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPreset(p.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedPreset === p.id
                        ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 dark:border-brand-500 text-brand-900 dark:text-brand-300 shadow-sm'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.name}</div>
                    <div className="text-[11px] opacity-70">
                      {p.percent}% {p.fixed > 0 ? `+ $${p.fixed.toFixed(2)}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedPreset === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fee Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customPercent}
                    onChange={(e) => setCustomPercent(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fixed Fee ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={customFixed}
                    onChange={(e) => setCustomFixed(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Results Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl flex flex-col justify-between">
            
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {calculationType === 'reverse' ? 'You Should Invoice:' : 'You Will Receive:'}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-brand-400 font-mono mt-1">
                ${calculationType === 'reverse' ? gross.toFixed(2) : net.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {calculationType === 'reverse'
                  ? `Includes $${fee.toFixed(2)} in payment gateway fees`
                  : `After deducting $${fee.toFixed(2)} processor fee`}
              </p>
            </div>

            <div className="my-6 py-4 border-y border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Invoice Gross Amount:</span>
                <span className="font-mono font-bold">${gross.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Gateway Cut ({percentRate}% + ${fixedRate}):</span>
                <span className="font-mono font-bold">-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Net In Your Bank:</span>
                <span className="font-mono font-bold">${net.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-700/40">
                <span>Effective Fee Rate:</span>
                <span className="font-mono">{effectiveFeePercent.toFixed(2)}%</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Result'}</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
