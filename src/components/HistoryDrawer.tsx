import React from 'react';
import { EquipmentAnalysisResult } from '../types/gym';
import { X, History, Trash2, ArrowRight, Dumbbell } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: EquipmentAnalysisResult[];
  onSelectHistoryItem: (item: EquipmentAnalysisResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-900" />
            <h3 className="text-base font-bold text-[#0f172a]">Scanned Equipment History</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-600" />
              <p className="text-sm font-semibold text-slate-600">No equipment scanned yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Point your camera at a gym machine or pick a preset to begin.
              </p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="group p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-900/40 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.equipmentName}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-200 border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-[#0f172a] group-hover:text-blue-900 line-clamp-1">
                      {item.equipmentName}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {item.exercises?.length || 1} exercises • {item.primaryCategory}
                    </span>
                    {item.scannedAt && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition-colors" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              {history.length} saved equipment scans
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
