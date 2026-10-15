import React from 'react';
import { Dumbbell, History, Camera } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onNewScan: () => void;
}

export const Header: React.FC<HeaderProps> = ({ historyCount, onOpenHistory, onNewScan }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LiftMi Brand - Clean, uncluttered, no redundant 'vision' badge */}
        <button
          type="button"
          onClick={onNewScan}
          className="flex items-center gap-2 group cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-[#0f172a] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-lg font-black tracking-tight text-[#0f172a] font-sans">
            Lift<span className="text-blue-900">Mi</span>
          </span>
        </button>

        {/* Action Controls - Symmetrical, sleek, perfectly balanced */}
        <div className="flex items-center gap-2">
          {/* New Scan Button - Dark navy color the user liked, compact and symmetrical */}
          <button
            type="button"
            onClick={onNewScan}
            className="h-8 px-2.5 sm:px-3 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="Scan new equipment"
          >
            <Camera className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-[11px] sm:text-xs">New Scan</span>
          </button>

          {/* History Button - Symmetrical counterpart */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="h-8 px-2.5 sm:px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="View scan history"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] sm:text-xs">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full text-[9px] font-mono font-bold bg-slate-100 text-slate-700 flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
