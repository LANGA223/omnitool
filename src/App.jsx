import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Minimize2, 
  QrCode, 
  FileSpreadsheet, 
  KeyRound, 
  DollarSign, 
  Type, 
  FileText, 
  ShieldCheck, 
  Hash, 
  Code, 
  ArrowLeft,
  Search,
  ExternalLink,
  Shield,
  Heart
} from 'lucide-react';

import Navbar from './components/Navbar';
import PrivacyBanner from './components/PrivacyBanner';
import ToolCard from './components/ToolCard';
import CategoryTabs from './components/CategoryTabs';

// Tools
import BackgroundRemover from './tools/BackgroundRemover';
import ImageCompressor from './tools/ImageCompressor';
import QrCodeGenerator from './tools/QrCodeGenerator';
import JsonCsvConverter from './tools/JsonCsvConverter';
import PasswordGenerator from './tools/PasswordGenerator';
import FeeCalculator from './tools/FeeCalculator';
import TextTools from './tools/TextTools';
import PdfMerger from './tools/PdfMerger';
import ExifStripper from './tools/ExifStripper';
import HashCalculator from './tools/HashCalculator';
import SvgOptimizer from './tools/SvgOptimizer';

const CATEGORIES = [
  { id: 'all', label: 'All Utilities' },
  { id: 'media', label: 'Media & Images' },
  { id: 'documents', label: 'Documents & PDFs' },
  { id: 'developer', label: 'Developer & Data' },
  { id: 'security', label: 'Security & Privacy' },
  { id: 'finance', label: 'Freelance & Finance' },
];

const TOOLS = [
  {
    id: 'background-remover',
    title: 'Background Remover',
    description: 'Cut out image backgrounds locally with Canvas color-keying, magic wand, and eraser brush.',
    category: 'media',
    icon: ImageIcon,
    colorClass: 'bg-gradient-to-br from-pink-500 to-rose-600',
    badge: 'Canvas API',
    component: BackgroundRemover,
    isNew: false,
  },
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    description: 'Shrink JPG, PNG, and WebP file sizes with live visual quality and dimension scaling previews.',
    category: 'media',
    icon: Minimize2,
    colorClass: 'bg-gradient-to-br from-brand-500 to-cyan-600',
    badge: 'Client Canvas',
    component: ImageCompressor,
    isNew: false,
  },
  {
    id: 'pdf-merger',
    title: 'Local PDF Merger',
    description: 'Combine multiple PDF files into one clean document without uploading contracts to remote servers.',
    category: 'documents',
    icon: FileText,
    colorClass: 'bg-gradient-to-br from-red-500 to-rose-600',
    badge: 'pdf-lib',
    component: PdfMerger,
    isNew: true,
  },
  {
    id: 'qr-generator',
    title: 'Vector QR Code Generator',
    description: 'Generate high-res PNG and infinite-resolution SVG QR codes with colors and custom margins.',
    category: 'media',
    icon: QrCode,
    colorClass: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    badge: 'Vector SVG',
    component: QrCodeGenerator,
    isNew: false,
  },
  {
    id: 'exif-stripper',
    title: 'EXIF & Photo Sanitizer',
    description: 'Remove sensitive GPS coordinates, camera serials, and timestamps from photos before sharing.',
    category: 'security',
    icon: ShieldCheck,
    colorClass: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    badge: 'Privacy Shield',
    component: ExifStripper,
    isNew: true,
  },
  {
    id: 'json-csv',
    title: 'JSON ↔ CSV Converter',
    description: 'Bidirectional client-side parser for confidential datasets with table preview and custom delimiters.',
    category: 'developer',
    icon: FileSpreadsheet,
    colorClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
    badge: 'Local Memory',
    component: JsonCsvConverter,
    isNew: false,
  },
  {
    id: 'password-generator',
    title: 'Cryptographic Passwords',
    description: 'High-entropy random passwords and memorable passphrases via browser Web Crypto API.',
    category: 'security',
    icon: KeyRound,
    colorClass: 'bg-gradient-to-br from-violet-500 to-purple-600',
    badge: 'Web Crypto',
    component: PasswordGenerator,
    isNew: false,
  },
  {
    id: 'hash-calculator',
    title: 'File & Text Checksums',
    description: 'Compute SHA-256, SHA-512, SHA-1, and MD5 hashes offline and verify files against known checksums.',
    category: 'security',
    icon: Hash,
    colorClass: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    badge: 'SubtleCrypto',
    component: HashCalculator,
    isNew: true,
  },
  {
    id: 'svg-optimizer',
    title: 'SVG Optimizer & Cleaner',
    description: 'Minify SVG markup, strip Figma/Illustrator metadata, and view real-time side-by-side rendering.',
    category: 'developer',
    icon: Code,
    colorClass: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    badge: 'Minifier',
    component: SvgOptimizer,
    isNew: true,
  },
  {
    id: 'fee-calculator',
    title: 'Freelance & Stripe Calculator',
    description: 'Calculate exact invoice amounts needed to receive your target payout after Stripe, PayPal, or Upwork fees.',
    category: 'finance',
    icon: DollarSign,
    colorClass: 'bg-gradient-to-br from-emerald-600 to-green-700',
    badge: 'Payout Math',
    component: FeeCalculator,
    isNew: false,
  },
  {
    id: 'text-tools',
    title: 'Text & Typography Tools',
    description: 'Live character/word counters, case converters (camelCase, snake_case), Base64, and line cleaning.',
    category: 'developer',
    icon: Type,
    colorClass: 'bg-gradient-to-br from-slate-600 to-slate-800',
    badge: 'Real-time Stats',
    component: TextTools,
    isNew: false,
  },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('omnitool_theme') === 'dark' ||
      (!('omnitool_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolId, setSelectedToolId] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('omnitool_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('omnitool_theme', 'light');
    }
  }, [darkMode]);

  const selectedTool = TOOLS.find((t) => t.id === selectedToolId);

  // Filter tools
  const filteredTools = TOOLS.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      t.title.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      t.badge.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-brand-500/20 selection:text-brand-600">
      
      {/* Top Sponsored Announcement Bar */}
      <a
        href="https://www.profitableratecpmnetwork.com/nrjngm9dic?key=064e41144d8b4e4740967c229b5f8f94"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white py-2 px-4 text-xs font-semibold text-center flex items-center justify-center gap-2 transition-all group shadow-sm z-50"
      >
        <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-black uppercase tracking-wider">
          Partner Offer
        </span>
        <span>⚡ Check out today's trending software deals & exclusive developer discounts</span>
        <span className="group-hover:translate-x-1 transition-transform">➔</span>
      </a>

      {/* Sticky Navbar */}
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onHomeClick={() => setSelectedToolId(null)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* If a tool is active, display the Tool View */}
        {selectedTool ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedToolId(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Utilities</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Running 100% locally in browser</span>
              </div>
            </div>

            {/* Tool Header */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-start gap-4">
              <div className={`p-3.5 rounded-2xl ${selectedTool.colorClass} text-white shadow-md shrink-0`}>
                <selectedTool.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedTool.title}
                  </h1>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {selectedTool.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  {selectedTool.description}
                </p>
              </div>
            </div>

            {/* Render Tool Component */}
            <selectedTool.component />

          </div>
        ) : (
          /* Dashboard Hub View */
          <div>
            
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-10 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60 mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free • No Sign-Up • Open-Source</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                The Privacy-First Browser <br />
                <span className="bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Utility Hub
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
                Compress images, merge PDFs, generate QR codes, strip photo metadata, and calculate payout fees — completely offline with zero server uploads.
              </p>
            </div>

            {/* Privacy Verification Banner */}
            <PrivacyBanner />

            {/* Search and Category Filter */}
            <CategoryTabs
              categories={CATEGORIES}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Tools Grid */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={(id) => setSelectedToolId(id)}
                  />
                ))}

                {/* Featured Partner Deals Smartlink Card */}
                <a
                  href="https://www.profitableratecpmnetwork.com/nrjngm9dic?key=064e41144d8b4e4740967c229b5f8f94"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-rose-500/5 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-dashed border-amber-300 dark:border-amber-700/60 hover:border-amber-500 dark:hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        Special Offer
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      🔥 Exclusive Partner Deals
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Discover curated discounts on software, high-speed hosting, productivity tools, and special perks.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium text-amber-600 dark:text-amber-400">
                      Sponsored
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                      <span>Explore Deals</span>
                      <span>➔</span>
                    </div>
                  </div>
                </a>
              </div>
            ) : (
              <div className="text-center py-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No utilities found matching "{searchQuery}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-3 px-4 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white"
                >
                  Reset Filters
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-8 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">OmniTool</span>
            <span>—</span>
            <span>Zero Tracking • 100% Client-Side Web Engine</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://github.com/LANGA223/omnitool"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <span>Built with React 19 & Tailwind CSS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
