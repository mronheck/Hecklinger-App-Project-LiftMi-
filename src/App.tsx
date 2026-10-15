import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CameraScanner } from './components/CameraScanner';
import { AiRoutineGenerator } from './components/AiRoutineGenerator';
import { ExerciseMuscleHub } from './components/ExerciseMuscleHub';
import { EquipmentActionIcons } from './components/EquipmentActionIcons';
import { EquipmentOverviewCard } from './components/EquipmentOverviewCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { EquipmentAnalysisResult, SampleEquipmentPreset } from './types/gym';
import { Sparkles, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'liftmi_scan_history_v1';

export default function App() {
  // Starts null so ONLY the scan option & prompt generator are on the interface initially!
  const [analysisResult, setAnalysisResult] = useState<EquipmentAnalysisResult | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isScannerExpanded, setIsScannerExpanded] = useState<boolean>(true);
  const [animKey, setAnimKey] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<EquipmentAnalysisResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: EquipmentAnalysisResult) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((p) => p.equipmentName !== item.equipmentName)].slice(0, 20);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save history:', err);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing history:', e);
    }
  };

  // Perform AI analysis on uploaded or captured image
  const handleAnalyze = async ({
    imageBase64,
    mimeType,
    experienceLevel,
    promptNote,
  }: {
    imageBase64: string;
    mimeType: string;
    experienceLevel: string;
    promptNote?: string;
  }) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          experienceLevel,
          userPrompt: promptNote,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: EquipmentAnalysisResult = await response.json();
      data.scannedAt = new Date().toISOString();
      data.thumbnailUrl = imageBase64.startsWith('data:') ? imageBase64 : undefined;

      // Automatically collapse the scanner and dismiss the uploaded image
      setIsScannerExpanded(false);
      setAnalysisResult(data);
      if (data.exercises && data.exercises.length > 0) {
        setSelectedExerciseId(data.exercises[0].id);
      }
      saveToHistory(data);

      // Trigger smooth fading animation
      setAnimKey((prev) => prev + 1);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(
        'Could not analyze equipment. Check your internet connection or try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: SampleEquipmentPreset) => {
    const data: EquipmentAnalysisResult = {
      ...preset.presetData,
      scannedAt: new Date().toISOString(),
      thumbnailUrl: preset.imageUrl,
    };

    setIsScannerExpanded(false);
    setAnalysisResult(data);
    if (data.exercises && data.exercises.length > 0) {
      setSelectedExerciseId(data.exercises[0].id);
    }
    saveToHistory(data);

    setAnimKey((prev) => prev + 1);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Handle custom AI-generated full workout routine
  const handleRoutineGenerated = (routine: EquipmentAnalysisResult) => {
    setIsScannerExpanded(false);
    setAnalysisResult(routine);
    if (routine.exercises && routine.exercises.length > 0) {
      setSelectedExerciseId(routine.exercises[0].id);
    }
    saveToHistory(routine);

    setAnimKey((prev) => prev + 1);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleSelectHistoryItem = (item: EquipmentAnalysisResult) => {
    setIsScannerExpanded(false);
    setAnalysisResult(item);
    if (item.exercises && item.exercises.length > 0) {
      setSelectedExerciseId(item.exercises[0].id);
    }
    setAnimKey((prev) => prev + 1);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleNewScan = () => {
    setIsScannerExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentExercise =
    analysisResult?.exercises.find((e) => e.id === selectedExerciseId) ||
    analysisResult?.exercises[0];

  const currentMuscleKeys = currentExercise ? currentExercise.muscleKeys : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      {/* Top Navigation */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewScan={handleNewScan}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-4 sm:space-y-5">
        {/* Intro Hero Section (visible when only scanning) */}
        {!analysisResult && (
          <div className="animate-fade-in flex flex-col items-center text-center max-w-2xl mx-auto pt-1 pb-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Biomechanics & Muscle Vision</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
              Snap Equipment or Generate a Routine
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Scan any machine or free weight to see muscles hit, or prompt the AI to generate a full workout session.
            </p>
          </div>
        )}

        {/* 1. Scan Option: Present 100% of the time on the interface */}
        <section id="scanner-section">
          <CameraScanner
            onAnalyze={handleAnalyze}
            onSelectPreset={handleSelectPreset}
            isAnalyzing={isAnalyzing}
            isExpanded={isScannerExpanded}
            onToggleExpand={setIsScannerExpanded}
            currentEquipmentName={analysisResult?.equipmentName}
            thumbnailUrl={analysisResult?.thumbnailUrl}
          />
        </section>

        {/* 2. AI Workout Routine Generator based on Any Prompt */}
        <section id="routine-generator-section">
          <AiRoutineGenerator onRoutineGenerated={handleRoutineGenerated} />
        </section>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3. Resulting Information: Equipment/Routine Headline, Possible Exercises & Muscles Hit */}
        {analysisResult && currentExercise && (
          <section
            key={animKey}
            id="analysis-results-section"
            className="space-y-4 animate-fade-in"
          >
            {/* Overview & Scanned Thumbnail/Badge */}
            <EquipmentOverviewCard data={analysisResult} />

            {/* Exercises & Affiliated Muscle Visual Hub */}
            {analysisResult.exercises && analysisResult.exercises.length > 0 && (
              <ExerciseMuscleHub
                exercises={analysisResult.exercises}
                selectedExerciseId={selectedExerciseId}
                onSelectExercise={(id) => setSelectedExerciseId(id)}
                allTargetedMuscles={analysisResult.overallTargetedMuscles}
              />
            )}

            {/* Simple Icons (Form Instructions, Safety Tips, Timer & Sets, Voice Coach) */}
            <EquipmentActionIcons
              currentExercise={currentExercise}
              setupAndSafety={analysisResult.setupAndSafety}
            />
          </section>
        )}
      </main>

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={clearHistory}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500 font-mono shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LiftMi • Real-time Gym Machinery & Muscle Intelligence</span>
          <span>Powered by Gemini 3.8 Flash Vision</span>
        </div>
      </footer>
    </div>
  );
}
