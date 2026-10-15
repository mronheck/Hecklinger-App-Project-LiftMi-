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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative navy gradient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
            {/* Small image of the equipment scanned */}
            {data.thumbnailUrl && (
              <div
                onClick={() => setShowFullPhoto(true)}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-200 hover:border-blue-900 bg-slate-100 shadow-2xs cursor-pointer group transition-all duration-300 hover:shadow-md"
                title="Click to view full scanned photo"
              >
                <img
                  src={data.thumbnailUrl}
                  alt={data.equipmentName}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#0f172a]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0f172a]/80 via-[#0f172a]/50 to-transparent p-1 flex items-center justify-between">
                  <span className="text-[8px] font-mono text-white font-bold uppercase tracking-wider">
                    Scanned
                  </span>
                  <span className="text-[8px] text-slate-200 font-mono">View</span>
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                    data.equipmentType === 'free_weight'
                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                      : data.equipmentType === 'cable'
                      ? 'bg-sky-50 text-sky-900 border border-sky-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {data.equipmentType.replace('_', ' ')}
                </span>

                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {data.primaryCategory}
                </span>

                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> {data.confidenceScore}% AI Confidence
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">
                {data.equipmentName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {data.punchySummary}
              </p>
            </div>
          </div>

          {/* Quick Exercise Count Metric */}
          <div className="flex items-center gap-3 self-start lg:self-auto bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold font-mono text-[#0f172a]">
                {data.exercises.length} {data.exercises.length === 1 ? 'Exercise' : 'Exercises'}
              </div>
              <div className="text-[9px] text-slate-500 uppercase font-mono">
                Available to perform
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Full view modal for scanned photo */}
      {showFullPhoto && data.thumbnailUrl && (
        <div
          className="fixed inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowFullPhoto(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl"
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
