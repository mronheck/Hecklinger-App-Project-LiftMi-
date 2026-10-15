import React, { useState, useEffect } from 'react';
import { TargetedMuscle } from '../types/gym';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface MuscleAnatomyViewerProps {
  highlightedKeys: string[];
  allTargetedMuscles: TargetedMuscle[];
  exerciseName?: string;
  className?: string;
}

export const MuscleAnatomyViewer: React.FC<MuscleAnatomyViewerProps> = ({
  highlightedKeys,
  allTargetedMuscles,
  exerciseName = '',
  className = '',
}) => {
  // Determine if this exercise predominantly targets the back (posterior)
  const isBackExercise =
    highlightedKeys.some((k) =>
      ['lats', 'rhomboids', 'lower_back', 'deltoid_posterior', 'hamstrings'].includes(k)
    ) &&
    !highlightedKeys.some((k) =>
      ['chest_upper', 'chest_mid', 'chest_lower', 'quads', 'abs'].includes(k)
    );

  const [activeView, setActiveView] = useState<'anterior' | 'posterior'>(
    isBackExercise ? 'posterior' : 'anterior'
  );
  const [isZoomed, setIsZoomed] = useState<boolean>(true);
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<string | null>(null);

  // Auto-switch view when exercise changes
  useEffect(() => {
    setActiveView(isBackExercise ? 'posterior' : 'anterior');
    setSelectedMuscleKey(null);
  }, [exerciseName, isBackExercise]);

  // Compute zoomed-in viewBox bounding the active muscles
  const getViewBox = () => {
    if (!isZoomed || highlightedKeys.length === 0) {
      return '0 0 200 350';
    }

    const hasLower = highlightedKeys.some((k) =>
      ['glutes', 'quads', 'hamstrings', 'calves'].includes(k)
    );
    const hasUpper = highlightedKeys.some((k) =>
      [
        'chest_upper',
        'chest_mid',
        'chest_lower',
        'deltoid_anterior',
        'deltoid_lateral',
        'deltoid_posterior',
        'biceps',
        'triceps',
        'forearms',
        'traps',
        'lats',
        'rhomboids',
      ].includes(k)
    );

    if (hasUpper && !hasLower) {
      // Zoomed in on upper torso, chest, shoulders, arms & upper back
      return '25 25 150 145';
    }
    if (hasLower && !hasUpper) {
      // Zoomed in on lower body, quads, hamstrings, glutes, calves
      return '38 135 124 195';
    }
    if (highlightedKeys.some((k) => ['abs', 'obliques', 'lower_back'].includes(k)) && !hasUpper && !hasLower) {
      return '45 80 110 110';
    }
    // Multi-compound full body
    return '15 20 170 305';
  };

  const getMuscleStatus = (key: string) => {
    if (!highlightedKeys.includes(key)) return 'inactive';
    const found = allTargetedMuscles.find(
      (m) => m.muscleKey.toLowerCase() === key.toLowerCase() || key.toLowerCase().includes(m.muscleKey.toLowerCase())
    );
    if (found) return found.role;
    return 'primary';
  };

  const getFillColor = (status: string, isSelected: boolean) => {
    if (isSelected) return '#2563eb';
    switch (status) {
      case 'primary':
        return '#0f172a'; // athletic dark navy
      case 'secondary':
        return '#0284c7'; // bright sky blue
      case 'stabilizer':
        return '#059669'; // emerald
      default:
        return '#f1f5f9'; // clean neutral grey for inactive
    }
  };

  const getStrokeColor = (status: string, isSelected: boolean) => {
    if (isSelected) return '#1d4ed8';
    switch (status) {
      case 'primary':
        return '#0f172a';
      case 'secondary':
        return '#0369a1';
      case 'stabilizer':
        return '#047857';
      default:
        return '#cbd5e1';
    }
  };

  function formatMuscleName(key: string) {
    return key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Find info about selected muscle for popup
  const selectedInfo = selectedMuscleKey
    ? allTargetedMuscles.find(
        (m) =>
          m.muscleKey.toLowerCase() === selectedMuscleKey.toLowerCase() ||
          selectedMuscleKey.toLowerCase().includes(m.muscleKey.toLowerCase())
      ) || {
        muscleKey: selectedMuscleKey,
        name: formatMuscleName(selectedMuscleKey),
        role: getMuscleStatus(selectedMuscleKey) as any,
        activationPercentage: getMuscleStatus(selectedMuscleKey) === 'primary' ? 90 : 70,
        briefFunction: 'Primary driver and torque generator during this exercise.',
      }
    : null;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Visual Controls: Front / Back switch & Zoom Toggle */}
      <div className="flex items-center justify-between w-full max-w-sm mb-3 px-2">
        {/* Front / Back Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveView('anterior')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeView === 'anterior'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Front View
          </button>
          <button
            type="button"
            onClick={() => setActiveView('posterior')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeView === 'posterior'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Back View
          </button>
        </div>

        {/* Zoom Toggle */}
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
            isZoomed
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
          title={isZoomed ? 'Zoom Out to Full Body' : 'Zoom In on Active Muscles'}
        >
          {isZoomed ? (
            <>
              <ZoomOut className="w-3.5 h-3.5" />
              <span>Full Body</span>
            </>
          ) : (
            <>
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Zoom In</span>
            </>
          )}
        </button>
      </div>

      {/* Pure Zoomed-in Anatomical Canvas */}
      <div className="relative w-full max-w-xs sm:max-w-sm aspect-[4/3] sm:aspect-square flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-200/80 p-2 overflow-hidden shadow-2xs">
        <svg
          viewBox={getViewBox()}
          className="w-full h-full select-none transition-all duration-500 ease-out filter drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ================= ANTERIOR (FRONT) VIEW ================= */}
          {activeView === 'anterior' && (
            <g id="anterior-anatomy">
              {/* Head */}
              <circle cx="100" cy="24" r="14" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
              {/* Neck */}
              <rect x="95" y="37" width="10" height="11" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />

              {/* Traps (Front) */}
              <path
                d="M88,44 Q100,50 112,44 L118,54 L82,54 Z"
                fill={getFillColor(getMuscleStatus('traps'), selectedMuscleKey === 'traps')}
                stroke={getStrokeColor(getMuscleStatus('traps'), selectedMuscleKey === 'traps')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('traps')}
              />

              {/* Deltoids (Anterior & Lateral) */}
              <path
                d="M80,56 Q66,66 68,88 Q78,88 84,72 Z"
                fill={getFillColor(getMuscleStatus('deltoid_anterior') !== 'inactive' ? getMuscleStatus('deltoid_anterior') : getMuscleStatus('deltoid_lateral'), selectedMuscleKey === 'deltoid_anterior' || selectedMuscleKey === 'deltoid_lateral')}
                stroke={getStrokeColor(getMuscleStatus('deltoid_anterior'), selectedMuscleKey === 'deltoid_anterior')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('deltoid_anterior')}
              />
              <path
                d="M120,56 Q134,66 132,88 Q122,88 116,72 Z"
                fill={getFillColor(getMuscleStatus('deltoid_anterior') !== 'inactive' ? getMuscleStatus('deltoid_anterior') : getMuscleStatus('deltoid_lateral'), selectedMuscleKey === 'deltoid_anterior' || selectedMuscleKey === 'deltoid_lateral')}
                stroke={getStrokeColor(getMuscleStatus('deltoid_anterior'), selectedMuscleKey === 'deltoid_anterior')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('deltoid_anterior')}
              />

              {/* Chest / Pectorals */}
              <path
                d="M84,56 Q100,58 100,72 Q100,94 82,90 Q74,86 78,64 Z"
                fill={getFillColor(getMuscleStatus('chest_mid') !== 'inactive' ? getMuscleStatus('chest_mid') : getMuscleStatus('chest_upper'), selectedMuscleKey === 'chest_mid' || selectedMuscleKey === 'chest_upper')}
                stroke={getStrokeColor(getMuscleStatus('chest_mid'), selectedMuscleKey === 'chest_mid')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('chest_mid')}
              />
              <path
                d="M116,56 Q100,58 100,72 Q100,94 118,90 Q126,86 122,64 Z"
                fill={getFillColor(getMuscleStatus('chest_mid') !== 'inactive' ? getMuscleStatus('chest_mid') : getMuscleStatus('chest_upper'), selectedMuscleKey === 'chest_mid' || selectedMuscleKey === 'chest_upper')}
                stroke={getStrokeColor(getMuscleStatus('chest_mid'), selectedMuscleKey === 'chest_mid')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('chest_mid')}
              />

              {/* Biceps */}
              <path
                d="M66,90 Q62,112 68,124 Q74,124 76,102 Q76,92 66,90 Z"
                fill={getFillColor(getMuscleStatus('biceps'), selectedMuscleKey === 'biceps')}
                stroke={getStrokeColor(getMuscleStatus('biceps'), selectedMuscleKey === 'biceps')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('biceps')}
              />
              <path
                d="M134,90 Q138,112 132,124 Q126,124 124,102 Q124,92 134,90 Z"
                fill={getFillColor(getMuscleStatus('biceps'), selectedMuscleKey === 'biceps')}
                stroke={getStrokeColor(getMuscleStatus('biceps'), selectedMuscleKey === 'biceps')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('biceps')}
              />

              {/* Forearms */}
              <path
                d="M66,128 Q60,154 64,172 L70,172 Q76,150 72,128 Z"
                fill={getFillColor(getMuscleStatus('forearms'), selectedMuscleKey === 'forearms')}
                stroke={getStrokeColor(getMuscleStatus('forearms'), selectedMuscleKey === 'forearms')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('forearms')}
              />
              <path
                d="M134,128 Q140,154 136,172 L130,172 Q124,150 128,128 Z"
                fill={getFillColor(getMuscleStatus('forearms'), selectedMuscleKey === 'forearms')}
                stroke={getStrokeColor(getMuscleStatus('forearms'), selectedMuscleKey === 'forearms')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('forearms')}
              />

              {/* Abs / Core */}
              <path
                d="M84,94 L100,94 L100,140 L84,136 Z"
                fill={getFillColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                stroke={getStrokeColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('abs')}
              />
              <path
                d="M116,94 L100,94 L100,140 L116,136 Z"
                fill={getFillColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                stroke={getStrokeColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('abs')}
              />

              {/* Obliques */}
              <path
                d="M78,98 L82,98 L82,136 L76,132 Z"
                fill={getFillColor(getMuscleStatus('obliques'), selectedMuscleKey === 'obliques')}
                stroke={getStrokeColor(getMuscleStatus('obliques'), selectedMuscleKey === 'obliques')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('obliques')}
              />
              <path
                d="M122,98 L118,98 L118,136 L124,132 Z"
                fill={getFillColor(getMuscleStatus('obliques'), selectedMuscleKey === 'obliques')}
                stroke={getStrokeColor(getMuscleStatus('obliques'), selectedMuscleKey === 'obliques')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('obliques')}
              />

              {/* Quads */}
              <path
                d="M74,146 Q96,144 96,188 L92,238 Q78,236 72,192 Q70,166 74,146 Z"
                fill={getFillColor(getMuscleStatus('quads'), selectedMuscleKey === 'quads')}
                stroke={getStrokeColor(getMuscleStatus('quads'), selectedMuscleKey === 'quads')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('quads')}
              />
              <path
                d="M126,146 Q104,144 104,188 L108,238 Q122,236 128,192 Q130,166 126,146 Z"
                fill={getFillColor(getMuscleStatus('quads'), selectedMuscleKey === 'quads')}
                stroke={getStrokeColor(getMuscleStatus('quads'), selectedMuscleKey === 'quads')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('quads')}
              />

              {/* Calves (Anterior Tibialis) */}
              <path
                d="M74,246 Q84,246 84,282 L82,312 L76,312 Q70,284 74,246 Z"
                fill={getFillColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                stroke={getStrokeColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('calves')}
              />
              <path
                d="M126,246 Q116,246 116,282 L118,312 L124,312 Q130,284 126,246 Z"
                fill={getFillColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                stroke={getStrokeColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('calves')}
              />
            </g>
          )}

          {/* ================= POSTERIOR (BACK) VIEW ================= */}
          {activeView === 'posterior' && (
            <g id="posterior-anatomy">
              {/* Head */}
              <circle cx="100" cy="24" r="14" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
              {/* Neck */}
              <rect x="95" y="37" width="10" height="11" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />

              {/* Upper & Middle Traps */}
              <path
                d="M84,46 L100,52 L116,46 L118,68 L100,88 L82,68 Z"
                fill={getFillColor(getMuscleStatus('traps'), selectedMuscleKey === 'traps')}
                stroke={getStrokeColor(getMuscleStatus('traps'), selectedMuscleKey === 'traps')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('traps')}
              />

              {/* Rear Deltoids */}
              <path
                d="M80,56 Q68,66 70,86 Q78,86 82,72 Z"
                fill={getFillColor(getMuscleStatus('deltoid_posterior'), selectedMuscleKey === 'deltoid_posterior')}
                stroke={getStrokeColor(getMuscleStatus('deltoid_posterior'), selectedMuscleKey === 'deltoid_posterior')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('deltoid_posterior')}
              />
              <path
                d="M120,56 Q132,66 130,86 Q122,86 118,72 Z"
                fill={getFillColor(getMuscleStatus('deltoid_posterior'), selectedMuscleKey === 'deltoid_posterior')}
                stroke={getStrokeColor(getMuscleStatus('deltoid_posterior'), selectedMuscleKey === 'deltoid_posterior')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('deltoid_posterior')}
              />

              {/* Triceps */}
              <path
                d="M66,88 Q62,112 68,124 Q74,124 76,102 Q76,90 66,88 Z"
                fill={getFillColor(getMuscleStatus('triceps'), selectedMuscleKey === 'triceps')}
                stroke={getStrokeColor(getMuscleStatus('triceps'), selectedMuscleKey === 'triceps')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('triceps')}
              />
              <path
                d="M134,88 Q138,112 132,124 Q126,124 124,102 Q124,90 134,88 Z"
                fill={getFillColor(getMuscleStatus('triceps'), selectedMuscleKey === 'triceps')}
                stroke={getStrokeColor(getMuscleStatus('triceps'), selectedMuscleKey === 'triceps')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('triceps')}
              />

              {/* Rhomboids */}
              <path
                d="M88,72 L100,88 L100,104 L88,88 Z"
                fill={getFillColor(getMuscleStatus('rhomboids'), selectedMuscleKey === 'rhomboids')}
                stroke={getStrokeColor(getMuscleStatus('rhomboids'), selectedMuscleKey === 'rhomboids')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('rhomboids')}
              />
              <path
                d="M112,72 L100,88 L100,104 L112,88 Z"
                fill={getFillColor(getMuscleStatus('rhomboids'), selectedMuscleKey === 'rhomboids')}
                stroke={getStrokeColor(getMuscleStatus('rhomboids'), selectedMuscleKey === 'rhomboids')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('rhomboids')}
              />

              {/* Lats (Latissimus Dorsi) */}
              <path
                d="M82,84 L96,92 L94,124 L86,128 Q76,108 82,84 Z"
                fill={getFillColor(getMuscleStatus('lats'), selectedMuscleKey === 'lats')}
                stroke={getStrokeColor(getMuscleStatus('lats'), selectedMuscleKey === 'lats')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('lats')}
              />
              <path
                d="M118,84 L104,92 L106,124 L114,128 Q124,108 118,84 Z"
                fill={getFillColor(getMuscleStatus('lats'), selectedMuscleKey === 'lats')}
                stroke={getStrokeColor(getMuscleStatus('lats'), selectedMuscleKey === 'lats')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('lats')}
              />

              {/* Lower Back / Erector Spinae */}
              <path
                d="M94,108 L106,108 L104,138 L96,138 Z"
                fill={getFillColor(getMuscleStatus('lower_back'), selectedMuscleKey === 'lower_back')}
                stroke={getStrokeColor(getMuscleStatus('lower_back'), selectedMuscleKey === 'lower_back')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('lower_back')}
              />

              {/* Gluteus Maximus */}
              <path
                d="M78,142 Q98,140 98,168 L96,182 Q82,188 74,172 Q72,154 78,142 Z"
                fill={getFillColor(getMuscleStatus('glutes'), selectedMuscleKey === 'glutes')}
                stroke={getStrokeColor(getMuscleStatus('glutes'), selectedMuscleKey === 'glutes')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('glutes')}
              />
              <path
                d="M122,142 Q102,140 102,168 L104,182 Q118,188 126,172 Q128,154 122,142 Z"
                fill={getFillColor(getMuscleStatus('glutes'), selectedMuscleKey === 'glutes')}
                stroke={getStrokeColor(getMuscleStatus('glutes'), selectedMuscleKey === 'glutes')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('glutes')}
              />

              {/* Hamstrings */}
              <path
                d="M74,188 Q96,186 94,228 L88,238 Q76,236 72,216 Q70,200 74,188 Z"
                fill={getFillColor(getMuscleStatus('hamstrings'), selectedMuscleKey === 'hamstrings')}
                stroke={getStrokeColor(getMuscleStatus('hamstrings'), selectedMuscleKey === 'hamstrings')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('hamstrings')}
              />
              <path
                d="M126,188 Q104,186 106,228 L112,238 Q124,236 128,216 Q130,200 126,188 Z"
                fill={getFillColor(getMuscleStatus('hamstrings'), selectedMuscleKey === 'hamstrings')}
                stroke={getStrokeColor(getMuscleStatus('hamstrings'), selectedMuscleKey === 'hamstrings')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('hamstrings')}
              />

              {/* Calves */}
              <path
                d="M73,246 Q86,246 86,282 L84,312 L76,312 Q68,284 73,246 Z"
                fill={getFillColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                stroke={getStrokeColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('calves')}
              />
              <path
                d="M127,246 Q114,246 114,282 L116,312 L124,312 Q132,284 127,246 Z"
                fill={getFillColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                stroke={getStrokeColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                strokeWidth="1.2"
                className="cursor-pointer transition-colors duration-200 hover:opacity-85"
                onClick={() => setSelectedMuscleKey('calves')}
              />
            </g>
          )}
        </svg>
      </div>

      {/* POPUP INFORMATION CARD (Appears ONLY when a muscle is clicked!) */}
      {selectedInfo && (
        <div
          className="fixed inset-0 z-50 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedMuscleKey(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl max-w-sm w-full relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div>
                <span
                  className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    selectedInfo.role === 'primary'
                      ? 'bg-blue-900 text-white'
                      : selectedInfo.role === 'secondary'
                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  {selectedInfo.role} Driver
                </span>
                <h4 className="text-base font-extrabold text-[#0f172a] mt-1 capitalize">
                  {selectedInfo.name}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMuscleKey(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-slate-100 my-2">
              <span className="text-xs text-slate-500 font-mono">Muscle Activation</span>
              <span className="text-base font-extrabold font-mono text-blue-900">
                {selectedInfo.activationPercentage}%
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {selectedInfo.briefFunction}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
