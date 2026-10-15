import React from 'react';
import { ExerciseItem } from '../types/gym';
import { Dumbbell } from 'lucide-react';

interface PossibleExercisesPickerProps {
  exercises: ExerciseItem[];
  selectedExerciseId: string;
  onSelectExercise: (id: string) => void;
}

export const PossibleExercisesPicker: React.FC<PossibleExercisesPickerProps> = ({
  exercises,
  selectedExerciseId,
  onSelectExercise,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-blue-900" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#0f172a] font-bold">
            Possible Exercises ({exercises.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Tap exercise to see muscles hit
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {exercises.map((ex) => {
          const isSelected = ex.id === selectedExerciseId;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelectExercise(ex.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-900 text-white shadow-xs scale-[1.02]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-blue-300' : 'bg-slate-400'
                }`}
              />
              <span>{ex.name}</span>
              <span
                className={`text-[10px] font-mono px-1 py-0.2 rounded uppercase ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {ex.movementType}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
