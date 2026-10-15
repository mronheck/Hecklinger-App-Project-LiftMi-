import React from 'react';
import { ExerciseItem, TargetedMuscle } from '../types/gym';
import { MuscleAnatomyViewer } from './MuscleAnatomyViewer';

interface ExerciseMuscleHubProps {
  exercises: ExerciseItem[];
  selectedExerciseId: string;
  onSelectExercise: (id: string) => void;
  allTargetedMuscles: TargetedMuscle[];
}

export const ExerciseMuscleHub: React.FC<ExerciseMuscleHubProps> = ({
  exercises,
  selectedExerciseId,
  onSelectExercise,
  allTargetedMuscles,
}) => {
  const currentExercise =
    exercises.find((e) => e.id === selectedExerciseId) || exercises[0];

  if (!currentExercise) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden p-3 sm:p-5">
      {/* 1. Exercise Selector Pills (No muscle text) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {exercises.map((ex) => {
          const isSelected = ex.id === currentExercise.id;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelectExercise(ex.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-900 text-white shadow-xs scale-[1.01]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-blue-300' : 'bg-slate-400'
                }`}
              />
              <span>{ex.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Pure Zoomed-in Muscle Visual (No text lists, click muscle for popup details) */}
      <MuscleAnatomyViewer
        highlightedKeys={currentExercise.muscleKeys}
        allTargetedMuscles={allTargetedMuscles}
        exerciseName={currentExercise.name}
        className="w-full"
      />
    </div>
  );
};
