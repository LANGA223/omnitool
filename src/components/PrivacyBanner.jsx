import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Terminal, ExternalLink, X } from 'lucide-react';

export default function PrivacyBanner() {
  const [showProofModal, setShowProofModal] = useState(false);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-purple-500/10 dark:from-brand-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-brand-200/60 dark:border-brand-800/40 p-4 sm:p-6 mb-8 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-brand-500/10 dark:bg-brand-400/10 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              100% Client-Side Privacy Guarantee
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                Zero Cloud Uploads
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Every single image, PDF, password, and JSON payload is processed locally in your browser memory using HTML5 Canvas, Web Crypto, and Web Workers. Your data never touches a remote server.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => setShowProofModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Terminal className="w-3.5 h-3.5 text-brand-500" />
            <span>Verify in DevTools</span>
          </button>
        </div>
      </div>

      {/* Proof Modal */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                How to Verify Our Privacy Claim
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              You don't need to trust us. You can independently verify that zero bytes ever leave your device:
            </p>

            <ol className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside font-medium">
              <li className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">F12</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+Shift+I</kbd> to open Browser Developer Tools.
              </li>
              <li className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                Switch to the <strong>Network</strong> tab and check the <code className="font-mono text-brand-600 dark:text-brand-400">Fetch / XHR</code> filter.
              </li>
              <li className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                Compress an image, merge PDFs, or hash a file. Notice: <strong>zero outgoing network requests</strong> are initiated!
              </li>
              <li className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                Turn off your Wi-Fi entirely — all tools will continue to run seamlessly offline.
              </li>
            </ol>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowProofModal(false)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
