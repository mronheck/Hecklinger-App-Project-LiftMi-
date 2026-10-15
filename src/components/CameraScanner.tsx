import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Zap,
  Sparkles,
  SlidersHorizontal,
  AlertCircle,
  Flame,
  Dumbbell,
  X,
} from 'lucide-react';
import { SAMPLE_EQUIPMENT_PRESETS } from '../data/sampleEquipment';
import { SampleEquipmentPreset } from '../types/gym';

interface CameraScannerProps {
  onAnalyze: (imageData: { imageBase64: string; mimeType: string; experienceLevel: string; promptNote?: string }) => void;
  onSelectPreset: (preset: SampleEquipmentPreset) => void;
  isAnalyzing: boolean;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
  currentEquipmentName?: string;
  thumbnailUrl?: string;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onAnalyze,
  onSelectPreset,
  isAnalyzing,
  isExpanded,
  onToggleExpand,
  currentEquipmentName,
  thumbnailUrl,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [experienceLevel, setExperienceLevel] = useState<'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced'>('All Levels');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clear preview image and stop camera whenever analysis completes
  useEffect(() => {
    if (!isAnalyzing && !isExpanded) {
      setPreviewImage(null);
      stopCamera();
    }
  }, [isAnalyzing, isExpanded]);

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. You can still upload a gym photo or pick from the sample presets below.'
          : 'Could not access camera on this device. Please use photo upload or sample presets.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Re-start camera when facing mode changes if active
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Capture frame from video stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    stopCamera();

    onAnalyze({
      imageBase64: dataUrl,
      mimeType: 'image/jpeg',
      experienceLevel,
      promptNote: customPrompt.trim() || undefined,
    });
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      stopCamera();

      onAnalyze({
        imageBase64: dataUrl,
        mimeType: file.type || 'image/jpeg',
        experienceLevel,
        promptNote: customPrompt.trim() || undefined,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Collapsed status bar
  if (!isExpanded && !isAnalyzing) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-500 ease-out">
        <div className="flex items-center gap-3">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Scanned Equipment"
              className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0f172a]">
                {currentEquipmentName ? `Showing Analysis: ${currentEquipmentName}` : 'Equipment Biomechanics Ready'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ready to analyze another machine or weight?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              onToggleExpand(true);
              startCamera();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            <span>Scan New Equipment</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-900" />
            <span>Upload Photo</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    );
  }

  // Active or Expanding Viewfinder
  return (
    <div className="space-y-4 animate-fade-in transition-all duration-500">
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md">
        {/* Top Controls Bar */}
        <div className="absolute top-0 inset-x-0 z-20 p-3 sm:p-4 bg-gradient-to-b from-[#0f172a]/95 via-[#0f172a]/70 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cameraActive ? 'bg-emerald-400' : 'bg-blue-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cameraActive ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-white">
              {cameraActive ? 'LIVE CAMERA SCANNER' : 'SCAN OR UPLOAD EQUIPMENT'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                showFilters
                  ? 'bg-blue-900 text-white border-blue-900 font-bold'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              title="Filter level & notes"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{experienceLevel}</span>
            </button>

            {cameraActive && (
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                title="Switch camera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {currentEquipmentName && (
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onToggleExpand(false);
                }}
                className="p-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                title="Collapse scanner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Optional Filters Drawer */}
        {showFilters && (
          <div className="absolute top-14 inset-x-3 z-30 p-3 bg-white/95 border border-slate-200 rounded-xl shadow-xl backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono uppercase font-semibold">Lifting Experience</span>
              <div className="flex gap-1">
                {(['All Levels', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      experienceLevel === lvl
                        ? 'bg-blue-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Optional focus (e.g., shoulder injury precaution, quad focus)"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-900"
              />
            </div>
          </div>
        )}

        {/* Viewport Area */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full bg-[#0a192f] flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
            }`}
          />

          {/* Idle / Camera Off State */}
          {!cameraActive && (
            <div className="text-center p-6 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-blue-900/30 border border-blue-400/30 text-blue-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Point Camera at Any Gym Equipment
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Take a picture or upload a gym photo. Once analyzed, LiftMi reveals the complete muscle heatmap and proper form guide.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Stream</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-900" />
                  <span>Upload Gym Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Reticle / Target Overlay */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div className="w-64 sm:w-80 h-52 sm:h-64 border-2 border-blue-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-blue-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-blue-400" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-blue-400" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-blue-400" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-blue-400/60" />
                  <div className="h-4 w-0.5 bg-blue-400/60 -ml-2" />
                </div>

                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse shadow-[0_0_8px_#3b82f6] top-1/2 -translate-y-1/2" />
              </div>

              <span className="mt-3 text-[11px] font-mono tracking-widest text-blue-200 font-bold bg-[#0f172a]/90 px-3 py-1 rounded-full border border-blue-400/40">
                ALIGN EQUIPMENT IN FRAME
              </span>
            </div>
          )}

          {/* Analyzing Loading Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-40 bg-[#0f172a]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full border-4 border-blue-400/20 border-t-blue-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-blue-300 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Analyzing Biomechanics...
                </h4>
              </div>
              <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                Detecting equipment, calculating primary and stabilizer muscle recruitment, and structuring proper form checkpoints.
              </p>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute bottom-4 inset-x-4 bg-rose-950/90 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2 z-30">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Bottom Shutter & Action Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {cameraActive ? (
              <button
                type="button"
                onClick={stopCamera}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-blue-900" />
                <span>Open Camera</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-900" />
              <span>Upload Photo</span>
            </button>
          </div>

          {/* Primary Snap Button */}
          {cameraActive && (
            <button
              type="button"
              onClick={captureSnapshot}
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>SCAN EQUIPMENT</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Preset Quick-Test Gallery */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-blue-900" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0f172a] font-bold">
              Instant 1-Click Equipment Presets
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Immediate demonstration without taking photo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {SAMPLE_EQUIPMENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                stopCamera();
                onSelectPreset(preset);
              }}
              className="group text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-900/40 transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-slate-200">
                <img
                  src={preset.imageUrl}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0f172a]/85 text-white font-bold">
                  {preset.type === 'free_weight' ? 'Free Weight' : preset.type === 'cable' ? 'Cable' : 'Machine'}
                </span>
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-blue-950 line-clamp-1">
                  {preset.name}
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  {preset.badge}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
