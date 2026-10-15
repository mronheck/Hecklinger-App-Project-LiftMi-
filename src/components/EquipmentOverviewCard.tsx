import React, { useState } from 'react';
import { EquipmentAnalysisResult } from '../types/gym';
import { Dumbbell, Sparkles, Maximize2, X } from 'lucide-react';

interface EquipmentOverviewCardProps {
  data: EquipmentAnalysisResult;
}

export const EquipmentOverviewCard: React.FC<EquipmentOverviewCardProps> = ({ data }) => {
  const [showFullPhoto, setShowFullPhoto] = useState(false);

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs relative overflow-hidden">
        {/* Subtle decorative navy gradient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Small image of the equipment scanned */}
            {data.thumbnailUrl && (
              <div
                onClick={() => setShowFullPhoto(true)}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border-2 border-slate-200 hover:border-blue-900 bg-slate-100 shadow-2xs cursor-pointer group transition-all duration-300 hover:shadow-md"
                title="Click to view full scanned photo"
              >
                <img
                  src={data.thumbnailUrl}
                  alt={data.equipmentName}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#0f172a]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0f172a]/80 via-[#0f172a]/50 to-transparent p-0.5 flex items-center justify-center">
                  <span className="text-[8px] font-mono text-white font-bold uppercase tracking-wider">
                    Photo
                  </span>
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    data.equipmentType === 'free_weight'
                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                      : data.equipmentType === 'cable'
                      ? 'bg-sky-50 text-sky-900 border border-sky-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {data.equipmentType.replace('_', ' ')}
                </span>

                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {data.primaryCategory}
                </span>

                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> {data.confidenceScore}%
                </span>
              </div>

              <h2 className="text-base sm:text-xl font-extrabold text-[#0f172a] tracking-tight line-clamp-1">
                {data.equipmentName}
              </h2>

              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                {data.punchySummary}
              </p>
            </div>
          </div>

          {/* Quick Exercise Count Metric (visible on tablet/desktop) */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold font-mono text-[#0f172a]">
                {data.exercises.length} {data.exercises.length === 1 ? 'Exercise' : 'Exercises'}
              </div>
              <div className="text-[8px] text-slate-400 uppercase font-mono">
                Available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Full view modal for scanned photo */}
      {showFullPhoto && data.thumbnailUrl && (
        <div
          className="fixed inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setShowFullPhoto(false)}
        >
          <div
            className="relative max-w-xl w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#0f172a]">
                Scanned Photo: {data.equipmentName}
              </span>
              <button
                type="button"
                onClick={() => setShowFullPhoto(false)}
                className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-slate-100 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={data.thumbnailUrl}
                alt={data.equipmentName}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
