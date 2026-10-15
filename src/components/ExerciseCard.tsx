import React, { useState, useEffect } from 'react';
import { ExerciseItem } from '../types/gym';
import {
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Gauge,
  Clock,
  Dumbbell,
  Compass,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ShieldCheck,
  Wrench,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Check,
  Trophy,
} from 'lucide-react';

interface ExerciseCardProps {
  exercises: ExerciseItem[];
  selectedExerciseId: string;
  onSelectExercise: (id: string) => void;
  setupAndSafety?: string[];
}

interface LoggedSet {
  id: string;
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercises,
  selectedExerciseId,
  onSelectExercise,
  setupAndSafety = [],
}) => {
  const currentExercise = exercises.find((e) => e.id === selectedExerciseId) || exercises[0];

  // Active Tab: 'form' | 'exercises' | 'safety' | 'tracker'
  const [activeTab, setActiveTab] = useState<'form' | 'exercises' | 'safety' | 'tracker'>('form');

  // Audio Coach state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Set Tracker & Rest Timer state
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

  if (!currentExercise) return null;

  // Speak form cues aloud
  const handlePlayFormAudio = async () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    setAudioError(null);

    const speechText = `${currentExercise.name}. ${currentExercise.briefDescription} Key form checkpoints: ${currentExercise.formCheckpoints
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
        setAudioError('Speech synthesis failed.');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
      setAudioError('Audio not supported on this device.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Exercise Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200">
              {currentExercise.movementType}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
              {currentExercise.difficulty}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Target: <strong className="text-slate-800 font-semibold">{currentExercise.targetArea}</strong>
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight">
            {currentExercise.name}
          </h3>
        </div>

        {/* Audio Coach Trigger Button */}
        <button
          type="button"
          onClick={handlePlayFormAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs self-start sm:self-auto cursor-pointer ${
            isPlayingAudio
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-white" />
              <span>Stop Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-blue-900" />
              <span>Voice Coach</span>
            </>
          )}
        </button>
      </div>

      {/* Sleek Tab Navigation Bar */}
      <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'form'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-300" />
            <span>Form Instructions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'exercises'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-blue-300" />
            <span>Possible Exercises ({exercises.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Safety Tips & Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-blue-300" />
            <span>Set Tracker & Timer</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT PANELS (Only ONE panel is open at a time for optimal, clean UI!) */}
      <div className="p-4 sm:p-6">
        {/* ================= TAB 1: FORM INSTRUCTIONS ================= */}
        {activeTab === 'form' && (
          <div className="space-y-5 animate-fade-in">
            {/* Brief description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {currentExercise.briefDescription}
            </p>

            {/* Biomechanical Alignment Targets */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Compass className="w-4 h-4 text-blue-900" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#0f172a] font-bold">
                  Biomechanical Alignment Targets
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                    <Gauge className="w-3.5 h-3.5 text-blue-900" /> Joint / Elbow Angle
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {currentExercise.visualBiometrics.idealJointAngle}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" /> Spine Alignment
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {currentExercise.visualBiometrics.spinePosition}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-700" /> Weight Path Vector
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {currentExercise.visualBiometrics.weightTrajectory}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-900" /> Tempo & Breathing
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    <span className="font-mono text-blue-900">{currentExercise.visualBiometrics.tempo}</span> •{' '}
                    {currentExercise.visualBiometrics.breathingCadence}
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Form & Posture Checkpoints */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-900" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#0f172a] font-bold">
                  Step-by-Step Execution Phases
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentExercise.formCheckpoints.map((cp, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-900" />
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                          Phase {idx + 1}: {cp.step}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {cp.instruction}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block mb-0.5">
                        Posture Check:
                      </span>
                      <p className="text-[11px] text-emerald-800 font-semibold flex items-start gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                        <span>{cp.visualPosturalCue}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach's Mind-Muscle Cue */}
            <div className="flex items-start gap-2.5 bg-blue-50/80 p-3 rounded-xl border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-900 font-bold block">
                  Coach's Mind-Muscle Cue
                </span>
                <p className="text-xs text-slate-800 font-medium mt-0.5">
                  "{currentExercise.proTip}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: POSSIBLE EXERCISES ================= */}
        {activeTab === 'exercises' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Select an Exercise to Update Form & Muscle Map
              </span>
              <span className="text-[11px] text-blue-900 font-semibold font-mono">
                {exercises.length} Exercises Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {exercises.map((ex) => {
                const isSelected = ex.id === currentExercise.id;
                return (
                  <div
                    key={ex.id}
                    onClick={() => onSelectExercise(ex.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-900/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ex.movementType}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {ex.difficulty}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#0f172a]'}`}>
                        {ex.name}
                      </h4>

                      <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                        {ex.briefDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                      <span className={isSelected ? 'text-blue-200' : 'text-slate-500'}>
                        {ex.protocols?.hypertrophy || '3 sets x 8-12 reps'}
                      </span>
                      <span
                        className={`font-semibold ${
                          isSelected ? 'text-white' : 'text-blue-900'
                        }`}
                      >
                        {isSelected ? 'Active Selection ✓' : 'Select →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SAFETY TIPS & SETUP ================= */}
        {activeTab === 'safety' && (
          <div className="space-y-5 animate-fade-in">
            {/* Equipment Setup Adjustments (Pins, Bench & Grips) */}
            {setupAndSafety && setupAndSafety.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-900" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#0f172a] font-bold">
                    Equipment Setup Checklist (Pins, Bench & Grips)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {setupAndSafety.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Do's vs Don'ts Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Form Do's */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <h5 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-mono">
                    Proper Form Essentials (Do's)
                  </h5>
                </div>
                <ul className="space-y-2">
                  {currentExercise.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes (Don'ts) */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h5 className="text-xs font-bold text-rose-950 uppercase tracking-wider font-mono">
                    Dangerous Mistakes to Avoid
                  </h5>
                </div>
                <ul className="space-y-2.5">
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
                      <p className="text-[11px] text-slate-600 mt-0.5 pl-1">
                        {item.whyItHurts}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SET TRACKER & TIMER ================= */}
        {activeTab === 'tracker' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Rest Countdown Timer Widget */}
              <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono uppercase mb-1 font-semibold">
                  <Timer className="w-3.5 h-3.5 text-blue-900" />
                  <span>Rest Countdown</span>
                </div>

                <div className={`text-4xl font-extrabold font-mono my-1 tracking-wider ${timerSeconds <= 5 && isTimerRunning ? 'text-rose-600 animate-pulse' : 'text-[#0f172a]'}`}>
                  {formatTimer(timerSeconds)}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Presets */}
                  <div className="flex gap-1 ml-1">
                    {[60, 90, 120].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setInitialTime(t);
                          setTimerSeconds(t);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                          initialTime === t
                            ? 'bg-blue-900 text-white font-bold'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sets & Reps Table */}
              <div className="md:col-span-7 space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-slate-500 uppercase px-2 font-semibold">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-4">Weight (lbs/kg)</span>
                  <span className="col-span-3">Reps</span>
                  <span className="col-span-3 text-center">Done</span>
                </div>

                {sets.map((set) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border transition-all ${
                      set.completed
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
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
                      className="col-span-4 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-900 shadow-2xs"
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
                      className="col-span-3 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-900 shadow-2xs"
                    />

                    <div className="col-span-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => toggleSetComplete(set.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          set.completed
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-700'
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
                  className="w-full py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-white text-[11px] font-mono font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 transition-all mt-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Set
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
