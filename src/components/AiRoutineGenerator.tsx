import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, Loader2 } from 'lucide-react';
import { EquipmentAnalysisResult } from '../types/gym';

interface AiRoutineGeneratorProps {
  onRoutineGenerated: (routine: EquipmentAnalysisResult) => void;
}

const QUICK_PROMPT_SUGGESTIONS = [
  'Push Day: Chest & Shoulders',
  'Dumbbell Leg & Core Burn',
  'Pull Day: Lats & Biceps',
  '30-Min Hotel Full Body',
  'Desk Worker Posture Reset',
];

export const AiRoutineGenerator: React.FC<AiRoutineGeneratorProps> = ({ onRoutineGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (customText?: string) => {
    const textToUse = customText || prompt.trim();
    if (!textToUse) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToUse }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate routine: status ${res.status}`);
      }

      const routineData: EquipmentAnalysisResult = await res.json();
      routineData.scannedAt = new Date().toISOString();
      onRoutineGenerated(routineData);
      setPrompt('');
    } catch (err: any) {
      console.error('Routine generation error:', err);
      setError('Could not generate routine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2 sm:mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center">
            <Wand2 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#0f172a] font-bold">
            AI Workout Generator
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
          Describe any workout or goal
        </span>
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. 30-min leg day, hotel chest & arms, posture..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-900 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-3 sm:px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Generate Routine</span>
              <span className="sm:hidden">Generate</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Prompt Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-1">
        <span className="text-[10px] font-mono text-slate-400 shrink-0 font-medium">
          Ideas:
        </span>
        {QUICK_PROMPT_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => {
              setPrompt(suggestion);
              handleGenerate(suggestion);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-all whitespace-nowrap border border-slate-200 hover:border-slate-300 cursor-pointer disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-2 text-[11px] text-rose-600 font-mono">
          {error}
        </div>
      )}
    </div>
  );
};
