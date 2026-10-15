import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, Check, Trophy } from 'lucide-react';
import { ExerciseItem } from '../types/gym';

interface WorkoutTrackerProps {
  currentExercise: ExerciseItem;
}

interface LoggedSet {
  id: string;
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ currentExercise }) => {
  const [sets, setSets] = useState<LoggedSet[]>([
    { id: '1', setNumber: 1, weight: '', reps: '10', completed: false },
    { id: '2', setNumber: 2, weight: '', reps: '10', completed: false },
    { id: '3', setNumber: 3, weight: '', reps: '10', completed: false },
  ]);

  // Rest Timer state
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

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-blue-900" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#0f172a] font-bold">
            Live Gym Set & Rest Tracker
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {currentExercise.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Rest Timer Widget */}
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

            {/* Quick Presets */}
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

        {/* Sets Logger */}
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
  );
};
