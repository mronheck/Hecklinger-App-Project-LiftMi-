import React, { useState, useEffect } from 'react';
import { ExerciseItem } from '../types/gym';
import {
  Compass,
  ShieldCheck,
  Timer,
  Volume2,
  VolumeX,
  X,
  Gauge,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Check,
} from 'lucide-react';

interface EquipmentActionIconsProps {
  currentExercise: ExerciseItem;
  setupAndSafety?: string[];
}

interface LoggedSet {
  id: string;
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
}

export const EquipmentActionIcons: React.FC<EquipmentActionIconsProps> = ({
  currentExercise,
  setupAndSafety = [],
}) => {
  // activeModal is null by default so NO information is displayed unless clicked on!
  const [activeModal, setActiveModal] = useState<'form' | 'safety' | 'timer' | null>(null);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Timer & Set Tracker state
  const [sets, setSets] = useState<LoggedSet[]>([
    { id: '1', setNumber: 1, weight: '', reps: '10', completed: false },
    { id: '2', setNumber: 2, weight: '', reps: '10', completed: false },
    { id: '3', setNumber: 3, weight: '', reps: '10', completed: false },
  ]);
  const [timerSeconds, setTimerSeconds] = useState<number>(90);
  const [initialTime, setInitialTime] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rest time is up! Ready for your next set.');
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleSetComplete = (id: string) => {
    setSets((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            setTimerSeconds(initialTime);
            setIsTimerRunning(true);
          }
          return { ...s, completed: nextCompleted };
        }
        return s;
      })
    );
  };

  const addSet = () => {
    setSets((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        setNumber: prev.length + 1,
        weight: prev[prev.length - 1]?.weight || '',
        reps: prev[prev.length - 1]?.reps || '10',
        completed: false,
      },
    ]);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Speak form cues aloud
  const handleToggleVoiceCoach = async () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    setAudioError(null);

    const speechText = `${currentExercise.name}. ${currentExercise.briefDescription} Form instructions: ${currentExercise.formCheckpoints
      .map((c) => `${c.step}: ${c.instruction}`)
      .join('. ')}. Pro tip: ${currentExercise.proTip}`;

    try {
      const res = await fetch('/api/speak-form-cue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => fallbackWebSpeech(speechText);
          await audio.play();
          return;
        }
      }
      fallbackWebSpeech(speechText);
    } catch {
      fallbackWebSpeech(speechText);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setAudioError('Audio failed.');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
      setAudioError('Audio not supported.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sleek Icon Bar (No open text, 100% visible on all screens with zero sideways swiping) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-3 shadow-xs">
        <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          {/* 1. Form Instructions Icon Button */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === 'form' ? null : 'form')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeModal === 'form'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="Form Instructions"
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>Form</span>
          </button>

          {/* 2. Safety Tips Icon Button */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === 'safety' ? null : 'safety')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeModal === 'safety'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="Safety Tips & Setup"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safety</span>
          </button>

          {/* 3. Rest Timer & Set Logger Icon Button */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === 'timer' ? null : 'timer')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeModal === 'timer'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="Rest Timer & Sets"
          >
            <Timer className="w-4 h-4 text-indigo-500" />
            <span>Timer</span>
          </button>

          {/* 4. Voice Coach Quick Toggle */}
          <button
            type="button"
            onClick={handleToggleVoiceCoach}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="Listen to Form Instructions"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4 text-white" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-blue-900" />
                <span>Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {audioError && (
        <div className="text-center text-[11px] text-rose-600 font-mono">
          {audioError}
        </div>
      )}

      {/* POPUP MODAL (Opens ONLY when an icon is selected, keeping the app 100% sleek and uncluttered!) */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeModal === 'form' && <Compass className="w-5 h-5 text-blue-900" />}
                {activeModal === 'safety' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                {activeModal === 'timer' && <Timer className="w-5 h-5 text-indigo-900" />}
                <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                  {activeModal === 'form' && `Form Instructions: ${currentExercise.name}`}
                  {activeModal === 'safety' && `Safety Tips: ${currentExercise.name}`}
                  {activeModal === 'timer' && `Set Tracker & Rest Timer`}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* === 1. FORM INSTRUCTIONS MODAL CONTENT === */}
              {activeModal === 'form' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {currentExercise.briefDescription}
                  </p>

                  {/* Biomechanics targets */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2">
                      Biomechanical Alignment Checkpoints
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] flex items-center gap-1 font-medium">
                          <Gauge className="w-3 h-3 text-blue-900" /> Joint Angle
                        </span>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {currentExercise.visualBiometrics.idealJointAngle}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] flex items-center gap-1 font-medium">
                          <ShieldAlert className="w-3 h-3 text-emerald-700" /> Spine Posture
                        </span>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {currentExercise.visualBiometrics.spinePosition}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] flex items-center gap-1 font-medium">
                          <ArrowRight className="w-3 h-3 text-blue-700" /> Weight Path Vector
                        </span>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {currentExercise.visualBiometrics.weightTrajectory}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-indigo-900" /> Tempo & Breathing
                        </span>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          <span className="font-mono text-blue-900">{currentExercise.visualBiometrics.tempo}</span> • {currentExercise.visualBiometrics.breathingCadence}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Execution */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2">
                      Phase-by-Phase Instructions
                    </span>
                    <div className="space-y-2">
                      {currentExercise.formCheckpoints.map((cp, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] font-bold text-blue-900 uppercase bg-blue-100 px-1.5 py-0.2 rounded">
                              Phase {idx + 1}: {cp.step}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800">{cp.instruction}</p>
                          <p className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Visual Check: {cp.visualPosturalCue}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tip */}
                  <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-xs">
                    <span className="text-[10px] font-mono uppercase text-blue-900 font-bold block">
                      Coach's Mind-Muscle Cue
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">
                      "{currentExercise.proTip}"
                    </p>
                  </div>
                </div>
              )}

              {/* === 2. SAFETY TIPS MODAL CONTENT === */}
              {activeModal === 'safety' && (
                <div className="space-y-4">
                  {/* Setup Checklist */}
                  {setupAndSafety && setupAndSafety.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-blue-900" /> Equipment Setup & Adjustments
                      </span>
                      <div className="space-y-1.5">
                        {setupAndSafety.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                            <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Do's */}
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5">
                    <span className="text-xs font-bold text-emerald-950 uppercase font-mono block mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Proper Form Essentials (Do's)
                    </span>
                    <ul className="space-y-1.5">
                      {currentExercise.dos.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dangerous Mistakes (Don'ts) */}
                  <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3.5">
                    <span className="text-xs font-bold text-rose-950 uppercase font-mono block mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> Dangerous Mistakes to Avoid
                    </span>
                    <ul className="space-y-2">
                      {currentExercise.donts.map((item, idx) => (
                        <li key={idx} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                                item.riskLevel === 'High'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {item.riskLevel} Hazard
                            </span>
                            <span className="font-semibold text-slate-900">{item.mistake}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 pl-1">{item.whyItHurts}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* === 3. TIMER & SET TRACKER MODAL CONTENT === */}
              {activeModal === 'timer' && (
                <div className="space-y-4">
                  {/* Rest Countdown Timer */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center flex flex-col items-center">
                    <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                      Rest Countdown Timer
                    </span>
                    <div className={`text-4xl font-extrabold font-mono my-1 tracking-wider ${timerSeconds <= 5 && isTimerRunning ? 'text-rose-600 animate-pulse' : 'text-[#0f172a]'}`}>
                      {formatTimer(timerSeconds)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(initialTime);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex gap-1 ml-1">
                        {[60, 90, 120].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setInitialTime(t);
                              setTimerSeconds(t);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold cursor-pointer ${
                              initialTime === t
                                ? 'bg-blue-900 text-white font-bold'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            {t}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sets and Reps */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-slate-500 uppercase px-2 font-semibold">
                      <span className="col-span-2">Set</span>
                      <span className="col-span-4">Weight (lbs/kg)</span>
                      <span className="col-span-3">Reps</span>
                      <span className="col-span-3 text-center">Done</span>
                    </div>

                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border ${
                          set.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="col-span-2 font-mono font-bold text-xs text-slate-800 pl-2">
                          #{set.setNumber}
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. 50"
                          value={set.weight}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSets((prev) =>
                              prev.map((s) => (s.id === set.id ? { ...s, weight: val } : s))
                            );
                          }}
                          className="col-span-4 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="10"
                          value={set.reps}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSets((prev) =>
                              prev.map((s) => (s.id === set.id ? { ...s, reps: val } : s))
                            );
                          }}
                          className="col-span-3 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900"
                        />
                        <div className="col-span-3 flex justify-center">
                          <button
                            type="button"
                            onClick={() => toggleSetComplete(set.id)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${
                              set.completed ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-400'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addSet}
                      className="w-full py-1.5 rounded-lg border border-dashed border-slate-300 text-[11px] font-mono font-semibold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-50 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Set
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
