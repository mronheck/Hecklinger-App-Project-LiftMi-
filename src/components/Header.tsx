import React from 'react';
import { Dumbbell, History, Sparkles } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onNewScan: () => void;
}

export const Header: React.FC<HeaderProps> = ({ historyCount, onOpenHistory, onNewScan }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LiftMi Brand */}
        <button
          type="button"
          onClick={onNewScan}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#0f172a] font-sans">
                Lift<span className="text-blue-900">Mi</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200">
                AI Vision
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono hidden sm:block">
              Equipment & Muscle Impact Visualizer
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onNewScan}
            className="px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>New Scan</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-blue-800" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
