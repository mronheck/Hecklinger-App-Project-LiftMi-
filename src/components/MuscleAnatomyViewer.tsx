import React, { useState } from 'react';
import { TargetedMuscle } from '../types/gym';
import { Activity, Layers, Sparkles } from 'lucide-react';

interface MuscleAnatomyViewerProps {
  highlightedKeys: string[];
  allTargetedMuscles: TargetedMuscle[];
  exerciseName?: string;
  className?: string;
}

export const MuscleAnatomyViewer: React.FC<MuscleAnatomyViewerProps> = ({
  highlightedKeys,
  allTargetedMuscles,
  exerciseName,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'both' | 'anterior' | 'posterior'>('both');
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<string | null>(null);

  // Helper to determine muscle role & styling
  const getMuscleStatus = (key: string) => {
    const foundInOverall = allTargetedMuscles.find(
      (m) => m.muscleKey.toLowerCase() === key.toLowerCase() || key.toLowerCase().includes(m.muscleKey.toLowerCase())
    );

    const isExplicitlyHighlighted = highlightedKeys.some(
      (k) => k.toLowerCase() === key.toLowerCase() || key.toLowerCase().includes(k.toLowerCase())
    );

    if (isExplicitlyHighlighted) {
      if (foundInOverall?.role === 'secondary') return 'secondary';
      if (foundInOverall?.role === 'stabilizer') return 'stabilizer';
      return 'primary';
    }

    if (foundInOverall) {
      return foundInOverall.role;
    }

    return 'inactive';
  };

  const getFillColor = (status: string, isSelected: boolean) => {
    if (isSelected) return '#2563eb'; // vivid royal blue when selected
    switch (status) {
      case 'primary':
        return '#1e3a8a'; // deep classic navy blue
      case 'secondary':
        return '#0284c7'; // bright sky blue
      case 'stabilizer':
        return '#059669'; // athletic emerald
      default:
        return '#e2e8f0'; // clean light grey
    }
  };

  const getStrokeColor = (status: string, isSelected: boolean) => {
    if (isSelected) return '#1d4ed8';
    switch (status) {
      case 'primary':
        return '#0f172a'; // dark navy stroke
      case 'secondary':
        return '#0369a1';
      case 'stabilizer':
        return '#047857';
      default:
        return '#cbd5e1'; // slate-300
    }
  };

  // Find info about selected muscle or first primary
  const selectedInfo = selectedMuscleKey
    ? allTargetedMuscles.find(
        (m) => m.muscleKey.toLowerCase() === selectedMuscleKey.toLowerCase() || selectedMuscleKey.toLowerCase().includes(m.muscleKey.toLowerCase())
      ) || {
        muscleKey: selectedMuscleKey,
        name: formatMuscleName(selectedMuscleKey),
        role: getMuscleStatus(selectedMuscleKey) as any,
        activationPercentage: getMuscleStatus(selectedMuscleKey) === 'primary' ? 88 : 65,
        briefFunction: 'Assists in joint stabilization and biomechanical force transfer during this movement.',
      }
    : null;

  function formatMuscleName(key: string) {
    return key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex p-1.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
              Biomechanical Muscle Engagement
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {exerciseName ? `Visual recruitment for ${exerciseName}` : 'Interactive anatomical heat map'}
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveView('both')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'both' ? 'bg-[#0f172a] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dual View
          </button>
          <button
            type="button"
            onClick={() => setActiveView('anterior')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'anterior' ? 'bg-[#0f172a] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anterior (Front)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('posterior')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'posterior' ? 'bg-[#0f172a] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Posterior (Back)
          </button>
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Anatomy SVG Canvas */}
        <div className="lg:col-span-8 flex flex-wrap justify-center items-center gap-6 sm:gap-10 py-2">
          {/* ANTERIOR (FRONT) VIEW */}
          {(activeView === 'both' || activeView === 'anterior') && (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Anterior (Front)
              </span>
              <div className="relative w-44 sm:w-56 h-80 sm:h-96 filter drop-shadow-sm">
                <svg
                  viewBox="0 0 200 350"
                  className="w-full h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Head */}
                  <circle cx="100" cy="24" r="15" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Neck */}
                  <rect x="94" y="38" width="12" height="12" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />

                  {/* Traps (Front) */}
                  <path
                    d="M88,44 Q100,50 112,44 L118,54 L82,54 Z"
                    fill={getFillColor(getMuscleStatus('traps'), selectedMuscleKey === 'traps')}
                    stroke={getStrokeColor(getMuscleStatus('traps'), selectedMuscleKey === 'traps')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'traps' ? null : 'traps')}
                  />

                  {/* Anterior Deltoids (Left & Right) */}
                  <path
                    d="M74,54 Q82,55 84,65 L72,82 Q65,68 74,54 Z"
                    fill={getFillColor(getMuscleStatus('deltoid_anterior'), selectedMuscleKey === 'deltoid_anterior')}
                    stroke={getStrokeColor(getMuscleStatus('deltoid_anterior'), selectedMuscleKey === 'deltoid_anterior')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'deltoid_anterior' ? null : 'deltoid_anterior')}
                  />
                  <path
                    d="M126,54 Q118,55 116,65 L128,82 Q135,68 126,54 Z"
                    fill={getFillColor(getMuscleStatus('deltoid_anterior'), selectedMuscleKey === 'deltoid_anterior')}
                    stroke={getStrokeColor(getMuscleStatus('deltoid_anterior'), selectedMuscleKey === 'deltoid_anterior')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'deltoid_anterior' ? null : 'deltoid_anterior')}
                  />

                  {/* Lateral Deltoids */}
                  <path
                    d="M66,60 Q72,55 74,68 L68,82 Q62,72 66,60 Z"
                    fill={getFillColor(getMuscleStatus('deltoid_lateral'), selectedMuscleKey === 'deltoid_lateral')}
                    stroke={getStrokeColor(getMuscleStatus('deltoid_lateral'), selectedMuscleKey === 'deltoid_lateral')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'deltoid_lateral' ? null : 'deltoid_lateral')}
                  />
                  <path
                    d="M134,60 Q128,55 126,68 L132,82 Q138,72 134,60 Z"
                    fill={getFillColor(getMuscleStatus('deltoid_lateral'), selectedMuscleKey === 'deltoid_lateral')}
                    stroke={getStrokeColor(getMuscleStatus('deltoid_lateral'), selectedMuscleKey === 'deltoid_lateral')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'deltoid_lateral' ? null : 'deltoid_lateral')}
                  />

                  {/* Upper Chest (Clavicular Pectoralis) */}
                  <path
                    d="M84,55 Q98,58 98,68 L84,72 Q78,65 84,55 Z"
                    fill={getFillColor(getMuscleStatus('chest_upper'), selectedMuscleKey === 'chest_upper')}
                    stroke={getStrokeColor(getMuscleStatus('chest_upper'), selectedMuscleKey === 'chest_upper')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'chest_upper' ? null : 'chest_upper')}
                  />
                  <path
                    d="M116,55 Q102,58 102,68 L116,72 Q122,65 116,55 Z"
                    fill={getFillColor(getMuscleStatus('chest_upper'), selectedMuscleKey === 'chest_upper')}
                    stroke={getStrokeColor(getMuscleStatus('chest_upper'), selectedMuscleKey === 'chest_upper')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'chest_upper' ? null : 'chest_upper')}
                  />

                  {/* Mid & Lower Chest (Sternocostal Pectoralis) */}
                  <path
                    d="M84,72 L98,68 Q98,88 84,90 Q76,86 84,72 Z"
                    fill={getFillColor(getMuscleStatus('chest_mid') || getMuscleStatus('chest_lower'), selectedMuscleKey === 'chest_mid')}
                    stroke={getStrokeColor(getMuscleStatus('chest_mid'), selectedMuscleKey === 'chest_mid')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'chest_mid' ? null : 'chest_mid')}
                  />
                  <path
                    d="M116,72 L102,68 Q102,88 116,90 Q124,86 116,72 Z"
                    fill={getFillColor(getMuscleStatus('chest_mid') || getMuscleStatus('chest_lower'), selectedMuscleKey === 'chest_mid')}
                    stroke={getStrokeColor(getMuscleStatus('chest_mid'), selectedMuscleKey === 'chest_mid')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'chest_mid' ? null : 'chest_mid')}
                  />

                  {/* Biceps (Left & Right) */}
                  <path
                    d="M68,84 Q74,84 76,102 Q70,112 64,106 Q62,94 68,84 Z"
                    fill={getFillColor(getMuscleStatus('biceps'), selectedMuscleKey === 'biceps')}
                    stroke={getStrokeColor(getMuscleStatus('biceps'), selectedMuscleKey === 'biceps')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'biceps' ? null : 'biceps')}
                  />
                  <path
                    d="M132,84 Q126,84 124,102 Q130,112 136,106 Q138,94 132,84 Z"
                    fill={getFillColor(getMuscleStatus('biceps'), selectedMuscleKey === 'biceps')}
                    stroke={getStrokeColor(getMuscleStatus('biceps'), selectedMuscleKey === 'biceps')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'biceps' ? null : 'biceps')}
                  />

                  {/* Forearms (Left & Right) */}
                  <path
                    d="M62,112 Q68,110 70,132 L64,148 L56,132 Q58,118 62,112 Z"
                    fill={getFillColor(getMuscleStatus('forearms'), selectedMuscleKey === 'forearms')}
                    stroke={getStrokeColor(getMuscleStatus('forearms'), selectedMuscleKey === 'forearms')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'forearms' ? null : 'forearms')}
                  />
                  <path
                    d="M138,112 Q132,110 130,132 L136,148 L144,132 Q142,118 138,112 Z"
                    fill={getFillColor(getMuscleStatus('forearms'), selectedMuscleKey === 'forearms')}
                    stroke={getStrokeColor(getMuscleStatus('forearms'), selectedMuscleKey === 'forearms')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'forearms' ? null : 'forearms')}
                  />

                  {/* Rectus Abdominis (Abs) */}
                  <path
                    d="M91,92 L98,92 L98,104 L91,104 Z"
                    fill={getFillColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    stroke={getStrokeColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    strokeWidth="1.2"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'abs' ? null : 'abs')}
                    className="cursor-pointer"
                  />
                  <path
                    d="M102,92 L109,92 L109,104 L102,104 Z"
                    fill={getFillColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    stroke={getStrokeColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    strokeWidth="1.2"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'abs' ? null : 'abs')}
                    className="cursor-pointer"
                  />
                  <path
                    d="M91,106 L98,106 L98,118 L91,118 Z"
                    fill={getFillColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    stroke={getStrokeColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    strokeWidth="1.2"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'abs' ? null : 'abs')}
                    className="cursor-pointer"
                  />
                  <path
                    d="M102,106 L109,106 L109,118 L102,118 Z"
                    fill={getFillColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    stroke={getStrokeColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    strokeWidth="1.2"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'abs' ? null : 'abs')}
                    className="cursor-pointer"
                  />
                  <path
                    d="M92,120 L98,120 L98,132 L93,130 Z"
                    fill={getFillColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    stroke={getStrokeColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    strokeWidth="1.2"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'abs' ? null : 'abs')}
                    className="cursor-pointer"
                  />
                  <path
                    d="M102,120 L108,120 L107,130 L102,132 Z"
                    fill={getFillColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    stroke={getStrokeColor(getMuscleStatus('abs'), selectedMuscleKey === 'abs')}
                    strokeWidth="1.2"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'abs' ? null : 'abs')}
                    className="cursor-pointer"
                  />

                  {/* External Obliques */}
                  <path
                    d="M80,94 Q88,96 88,124 L82,130 Q76,110 80,94 Z"
                    fill={getFillColor(getMuscleStatus('obliques'), selectedMuscleKey === 'obliques')}
                    stroke={getStrokeColor(getMuscleStatus('obliques'), selectedMuscleKey === 'obliques')}
                    strokeWidth="1.2"
                    className="cursor-pointer"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'obliques' ? null : 'obliques')}
                  />
                  <path
                    d="M120,94 Q112,96 112,124 L118,130 Q124,110 120,94 Z"
                    fill={getFillColor(getMuscleStatus('obliques'), selectedMuscleKey === 'obliques')}
                    stroke={getStrokeColor(getMuscleStatus('obliques'), selectedMuscleKey === 'obliques')}
                    strokeWidth="1.2"
                    className="cursor-pointer"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'obliques' ? null : 'obliques')}
                  />

                  {/* Quadriceps (Left & Right) */}
                  <path
                    d="M74,152 Q92,150 96,180 L92,230 Q80,234 72,216 Q68,180 74,152 Z"
                    fill={getFillColor(getMuscleStatus('quads'), selectedMuscleKey === 'quads')}
                    stroke={getStrokeColor(getMuscleStatus('quads'), selectedMuscleKey === 'quads')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'quads' ? null : 'quads')}
                  />
                  <path
                    d="M126,152 Q108,150 104,180 L108,230 Q120,234 128,216 Q132,180 126,152 Z"
                    fill={getFillColor(getMuscleStatus('quads'), selectedMuscleKey === 'quads')}
                    stroke={getStrokeColor(getMuscleStatus('quads'), selectedMuscleKey === 'quads')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'quads' ? null : 'quads')}
                  />

                  {/* Calves (Front Tibialis / Calves) */}
                  <path
                    d="M73,246 Q84,244 86,280 L84,312 L76,312 Q68,280 73,246 Z"
                    fill={getFillColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                    stroke={getStrokeColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'calves' ? null : 'calves')}
                  />
                  <path
                    d="M127,246 Q116,244 114,280 L116,312 L124,312 Q132,280 127,246 Z"
                    fill={getFillColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                    stroke={getStrokeColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'calves' ? null : 'calves')}
                  />
                </svg>
              </div>
            </div>
          )}

          {/* POSTERIOR (BACK) VIEW */}
          {(activeView === 'both' || activeView === 'posterior') && (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Posterior (Back)
              </span>
              <div className="relative w-44 sm:w-56 h-80 sm:h-96 filter drop-shadow-sm">
                <svg
                  viewBox="0 0 200 350"
                  className="w-full h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Head */}
                  <circle cx="100" cy="24" r="15" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Neck */}
                  <rect x="94" y="38" width="12" height="12" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />

                  {/* Trapezius */}
                  <path
                    d="M100,42 L116,56 L108,90 L100,98 L92,90 L84,56 Z"
                    fill={getFillColor(getMuscleStatus('traps'), selectedMuscleKey === 'traps')}
                    stroke={getStrokeColor(getMuscleStatus('traps'), selectedMuscleKey === 'traps')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'traps' ? null : 'traps')}
                  />

                  {/* Rear Deltoids */}
                  <path
                    d="M74,56 Q82,56 82,68 L70,82 Q64,70 74,56 Z"
                    fill={getFillColor(getMuscleStatus('deltoid_posterior'), selectedMuscleKey === 'deltoid_posterior')}
                    stroke={getStrokeColor(getMuscleStatus('deltoid_posterior'), selectedMuscleKey === 'deltoid_posterior')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'deltoid_posterior' ? null : 'deltoid_posterior')}
                  />
                  <path
                    d="M126,56 Q118,56 118,68 L130,82 Q136,70 126,56 Z"
                    fill={getFillColor(getMuscleStatus('deltoid_posterior'), selectedMuscleKey === 'deltoid_posterior')}
                    stroke={getStrokeColor(getMuscleStatus('deltoid_posterior'), selectedMuscleKey === 'deltoid_posterior')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'deltoid_posterior' ? null : 'deltoid_posterior')}
                  />

                  {/* Triceps */}
                  <path
                    d="M66,84 Q72,84 74,106 Q68,114 62,108 Q60,94 66,84 Z"
                    fill={getFillColor(getMuscleStatus('triceps'), selectedMuscleKey === 'triceps')}
                    stroke={getStrokeColor(getMuscleStatus('triceps'), selectedMuscleKey === 'triceps')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'triceps' ? null : 'triceps')}
                  />
                  <path
                    d="M134,84 Q128,84 126,106 Q132,114 138,108 Q140,94 134,84 Z"
                    fill={getFillColor(getMuscleStatus('triceps'), selectedMuscleKey === 'triceps')}
                    stroke={getStrokeColor(getMuscleStatus('triceps'), selectedMuscleKey === 'triceps')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'triceps' ? null : 'triceps')}
                  />

                  {/* Rhomboids & Infraspinatus */}
                  <path
                    d="M84,68 L100,72 L96,90 L82,82 Z"
                    fill={getFillColor(getMuscleStatus('rhomboids'), selectedMuscleKey === 'rhomboids')}
                    stroke={getStrokeColor(getMuscleStatus('rhomboids'), selectedMuscleKey === 'rhomboids')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'rhomboids' ? null : 'rhomboids')}
                  />
                  <path
                    d="M116,68 L100,72 L104,90 L118,82 Z"
                    fill={getFillColor(getMuscleStatus('rhomboids'), selectedMuscleKey === 'rhomboids')}
                    stroke={getStrokeColor(getMuscleStatus('rhomboids'), selectedMuscleKey === 'rhomboids')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'rhomboids' ? null : 'rhomboids')}
                  />

                  {/* Latissimus Dorsi (Lats) */}
                  <path
                    d="M82,84 L96,92 L94,124 L86,128 Q76,108 82,84 Z"
                    fill={getFillColor(getMuscleStatus('lats'), selectedMuscleKey === 'lats')}
                    stroke={getStrokeColor(getMuscleStatus('lats'), selectedMuscleKey === 'lats')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'lats' ? null : 'lats')}
                  />
                  <path
                    d="M118,84 L104,92 L106,124 L114,128 Q124,108 118,84 Z"
                    fill={getFillColor(getMuscleStatus('lats'), selectedMuscleKey === 'lats')}
                    stroke={getStrokeColor(getMuscleStatus('lats'), selectedMuscleKey === 'lats')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'lats' ? null : 'lats')}
                  />

                  {/* Lower Back / Erector Spinae */}
                  <path
                    d="M94,108 L106,108 L104,138 L96,138 Z"
                    fill={getFillColor(getMuscleStatus('lower_back'), selectedMuscleKey === 'lower_back')}
                    stroke={getStrokeColor(getMuscleStatus('lower_back'), selectedMuscleKey === 'lower_back')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'lower_back' ? null : 'lower_back')}
                  />

                  {/* Gluteus Maximus */}
                  <path
                    d="M78,142 Q98,140 98,168 L96,182 Q82,188 74,172 Q72,154 78,142 Z"
                    fill={getFillColor(getMuscleStatus('glutes'), selectedMuscleKey === 'glutes')}
                    stroke={getStrokeColor(getMuscleStatus('glutes'), selectedMuscleKey === 'glutes')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'glutes' ? null : 'glutes')}
                  />
                  <path
                    d="M122,142 Q102,140 102,168 L104,182 Q118,188 126,172 Q128,154 122,142 Z"
                    fill={getFillColor(getMuscleStatus('glutes'), selectedMuscleKey === 'glutes')}
                    stroke={getStrokeColor(getMuscleStatus('glutes'), selectedMuscleKey === 'glutes')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'glutes' ? null : 'glutes')}
                  />

                  {/* Hamstrings */}
                  <path
                    d="M74,188 Q96,186 94,228 L88,238 Q76,236 72,216 Q70,200 74,188 Z"
                    fill={getFillColor(getMuscleStatus('hamstrings'), selectedMuscleKey === 'hamstrings')}
                    stroke={getStrokeColor(getMuscleStatus('hamstrings'), selectedMuscleKey === 'hamstrings')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'hamstrings' ? null : 'hamstrings')}
                  />
                  <path
                    d="M126,188 Q104,186 106,228 L112,238 Q124,236 128,216 Q130,200 126,188 Z"
                    fill={getFillColor(getMuscleStatus('hamstrings'), selectedMuscleKey === 'hamstrings')}
                    stroke={getStrokeColor(getMuscleStatus('hamstrings'), selectedMuscleKey === 'hamstrings')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'hamstrings' ? null : 'hamstrings')}
                  />

                  {/* Calves */}
                  <path
                    d="M73,246 Q86,246 86,282 L84,312 L76,312 Q68,284 73,246 Z"
                    fill={getFillColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                    stroke={getStrokeColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'calves' ? null : 'calves')}
                  />
                  <path
                    d="M127,246 Q114,246 114,282 L116,312 L124,312 Q132,284 127,246 Z"
                    fill={getFillColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                    stroke={getStrokeColor(getMuscleStatus('calves'), selectedMuscleKey === 'calves')}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    onClick={() => setSelectedMuscleKey(selectedMuscleKey === 'calves' ? null : 'calves')}
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Muscle Info & Detail Card */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Muscle Spotlight
              </span>
              <span className="text-[11px] text-blue-900 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-blue-700" /> Tap muscle to inspect
              </span>
            </div>

            {selectedInfo ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-[#0f172a] capitalize">
                      {selectedInfo.name}
                    </h4>
                    <span
                      className={`inline-block px-2 py-0.5 mt-1 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        selectedInfo.role === 'primary'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : selectedInfo.role === 'secondary'
                          ? 'bg-sky-100 text-sky-900 border border-sky-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {selectedInfo.role} Driver
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-extrabold font-mono text-blue-900">
                      {selectedInfo.activationPercentage}%
                    </span>
                    <p className="text-[10px] text-slate-500">Peak Recruitment</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedInfo.role === 'primary'
                        ? 'bg-blue-900'
                        : selectedInfo.role === 'secondary'
                        ? 'bg-sky-600'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${selectedInfo.activationPercentage}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {selectedInfo.briefFunction}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 px-3 bg-white rounded-xl border border-dashed border-slate-300">
                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-700 font-semibold">Click on any highlighted muscle segment</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  View specific biomechanical activation, contraction role, and mind-muscle cues.
                </p>
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1 font-semibold">
              Recruitment Intensity
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                <span className="text-[11px] text-slate-700 font-semibold">Primary</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span className="text-[11px] text-slate-700 font-semibold">Secondary</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-[11px] text-slate-700 font-semibold">Stabilizer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
