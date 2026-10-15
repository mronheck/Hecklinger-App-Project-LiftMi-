export type MuscleKey =
  | 'chest_upper'
  | 'chest_mid'
  | 'chest_lower'
  | 'deltoid_anterior'
  | 'deltoid_lateral'
  | 'deltoid_posterior'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'traps'
  | 'lats'
  | 'rhomboids'
  | 'lower_back'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export interface TargetedMuscle {
  muscleKey: MuscleKey | string;
  name: string;
  role: 'primary' | 'secondary' | 'stabilizer';
  activationPercentage: number;
  briefFunction: string;
}

export interface FormCheckpoint {
  step: string;
  instruction: string;
  visualPosturalCue: string;
}

export interface VisualBiometrics {
  idealJointAngle: string;
  spinePosition: string;
  weightTrajectory: string;
  breathingCadence: string;
  tempo: string;
}

export interface CommonMistake {
  mistake: string;
  whyItHurts: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface Protocols {
  hypertrophy: string;
  strength: string;
  endurance: string;
  restTime: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  movementType: 'Compound' | 'Isolation';
  targetArea: string;
  muscleKeys: MuscleKey[] | string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  briefDescription: string;
  formCheckpoints: FormCheckpoint[];
  visualBiometrics: VisualBiometrics;
  dos: string[];
  donts: CommonMistake[];
  protocols: Protocols;
  proTip: string;
}

export interface EquipmentAnalysisResult {
  equipmentName: string;
  equipmentType: 'machine' | 'free_weight' | 'cable' | 'bodyweight_station' | 'rack_bench';
  confidenceScore: number;
  primaryCategory: string;
  punchySummary: string;
  overallTargetedMuscles: TargetedMuscle[];
  setupAndSafety: string[];
  exercises: ExerciseItem[];
  scannedAt?: string;
  thumbnailUrl?: string;
}

export interface SampleEquipmentPreset {
  id: string;
  name: string;
  type: 'free_weight' | 'machine' | 'cable';
  category: string;
  imageUrl: string;
  description: string;
  badge: string;
  presetData: EquipmentAnalysisResult;
}
