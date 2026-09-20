import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ToolCard({ tool, onSelect }) {
  const Icon = tool.icon;

  return (
    <div 
      onClick={() => onSelect(tool.id)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 dark:hover:shadow-brand-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Subtle hover gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.03] to-purple-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header: Icon + Category Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className={`p-3 rounded-xl ${tool.colorClass} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {tool.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center gap-1.5">
          {tool.title}
          {tool.isNew && (
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-brand-500 text-white leading-none">
              New
            </span>
          )}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Footer / Badge */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">
          {tool.badge}
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform">
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
