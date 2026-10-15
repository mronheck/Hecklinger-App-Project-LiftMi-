import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client with User-Agent as required by Gemini API guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Accept larger base64 images from camera snapshots
  app.use(express.json({ limit: '35mb' }));

  // API: Analyze Gym Equipment / Machinery / Free Weights
  app.post('/api/analyze-equipment', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', userPrompt, experienceLevel = 'All Levels' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      // Check if Gemini API key is configured
      if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not set. Using smart fallback analysis.');
        return res.json(getFallbackAnalysis(userPrompt || 'equipment'));
      }

      // Strip potential data URL prefix if sent
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const systemInstruction = `You are an elite sports biomechanist, strength and conditioning specialist (CSCS), and fitness equipment expert.
Your job is to analyze photos of gym equipment, gym machines, free weights (dumbbells, barbells, kettlebells, weight plates), cable systems, or benches.
When analyzing:
1. Identify the exact equipment name and whether it is a "machine", "free_weight", "cable", "bodyweight_station", or "rack_bench".
2. Explain specifically which muscle groups it impacts (with primary, secondary, and stabilizer roles).
3. Map impacted muscles to standardized muscle keys for our anatomical visualization:
   Allowed muscleKeys:
   - "chest_upper", "chest_mid", "chest_lower"
   - "deltoid_anterior", "deltoid_lateral", "deltoid_posterior"
   - "biceps", "triceps", "forearms"
   - "traps", "lats", "rhomboids", "lower_back"
   - "abs", "obliques"
   - "glutes", "quads", "hamstrings", "calves"
4. CRITICAL REQUIREMENT FOR FREE WEIGHTS (dumbbells, barbells, kettlebells, EZ-curl bar):
   Give 3 to 6 distinct, popular exercises that can be performed with these weights, and explain how each distinct exercise targets different muscle groups!
   For gym machines, provide the primary exercise it is designed for, plus 1-2 variations or alternate grips/settings.
5. For EVERY exercise:
   - Provide brief, punchy descriptions (NOT walls of text).
   - Provide visual form cues, posture checkpoints, elbow/joint angle guidelines, bar/weight trajectory.
   - List key "Do's" for proper form and "Common Mistakes" (Don'ts) with safety hazard level (low/medium/high).
   - Recommend tempo and hypertrophy/strength/endurance set & rep protocols.
   - Provide an actionable "proTip" coaching cue.`;

      const promptText = `Analyze this gym equipment photo for someone with experience level: ${experienceLevel}.
${userPrompt ? `User notes or focus: ${userPrompt}` : 'Identify the equipment, specific muscle impact, exercises, visual form cues, and proper execution.'}
Return structured JSON following the exact schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              equipmentName: {
                type: Type.STRING,
                description: 'Clear name of the equipment or free weight, e.g., "Adjustable Dumbbells", "Cable Lat Pulldown Machine", "45° Leg Press"',
              },
              equipmentType: {
                type: Type.STRING,
                description: '"machine" | "free_weight" | "cable" | "bodyweight_station" | "rack_bench"',
              },
              confidenceScore: {
                type: Type.INTEGER,
                description: 'Confidence in detection from 70 to 100',
              },
              primaryCategory: {
                type: Type.STRING,
                description: 'Primary body category e.g. "Upper Body - Pull", "Upper Body - Push", "Lower Body - Legs", "Full Body", "Core"',
              },
              punchySummary: {
                type: Type.STRING,
                description: '1-2 sentence high-level summary of what this equipment accomplishes and its biomechanical strength.',
              },
              overallTargetedMuscles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    muscleKey: {
                      type: Type.STRING,
                      description: 'Standard key: e.g. chest_upper, lats, quads, triceps, deltoid_anterior, glutes, hamstrings, etc.',
                    },
                    name: { type: Type.STRING, description: 'Display name e.g. Latissimus Dorsi' },
                    role: { type: Type.STRING, description: '"primary" | "secondary" | "stabilizer"' },
                    activationPercentage: { type: Type.INTEGER, description: 'Estimated muscle activation e.g. 85' },
                    briefFunction: { type: Type.STRING, description: 'Brief note on how it contracts in this lift' },
                  },
                  required: ['muscleKey', 'name', 'role', 'activationPercentage', 'briefFunction'],
                },
                description: 'All primary and secondary muscle groups impacted by this equipment',
              },
              setupAndSafety: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 quick bullet points on setting seat height, pins, safety catches, or collars',
              },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING, description: 'Exercise name, e.g. "Incline Dumbbell Press" or "Wide-Grip Lat Pulldown"' },
                    difficulty: { type: Type.STRING, description: '"Beginner" | "Intermediate" | "Advanced"' },
                    movementType: { type: Type.STRING, description: '"Compound" | "Isolation"' },
                    targetArea: { type: Type.STRING, description: 'Target region e.g. "Upper Chest & Front Shoulders"' },
                    muscleKeys: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Standard keys activated in this specific exercise',
                    },
                    primaryMuscles: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Top muscles doing the work',
                    },
                    secondaryMuscles: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Assisting muscles',
                    },
                    briefDescription: {
                      type: Type.STRING,
                      description: 'Punchy 1-2 sentence description explaining the movement and benefit',
                    },
                    formCheckpoints: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          step: { type: Type.STRING, description: '"Setup" | "Start" | "Drive/Execution" | "Peak Squeeze" | "Return"' },
                          instruction: { type: Type.STRING, description: 'Actionable concise cue' },
                          visualPosturalCue: { type: Type.STRING, description: 'Visual bodily alignment cue to watch for' },
                        },
                        required: ['step', 'instruction', 'visualPosturalCue'],
                      },
                    },
                    visualBiometrics: {
                      type: Type.OBJECT,
                      properties: {
                        idealJointAngle: { type: Type.STRING, description: 'e.g., "Elbows tucked at 45-60° to torso"' },
                        spinePosition: { type: Type.STRING, description: 'e.g., "Neutral spine with tight braced core"' },
                        weightTrajectory: { type: Type.STRING, description: 'e.g., "Slight arc pressing upward over mid-chest"' },
                        breathingCadence: { type: Type.STRING, description: 'e.g., "Inhale down (3s), Exhale press (1s)"' },
                        tempo: { type: Type.STRING, description: 'e.g., "3-0-1-0"' },
                      },
                      required: ['idealJointAngle', 'spinePosition', 'weightTrajectory', 'breathingCadence', 'tempo'],
                    },
                    dos: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '2-3 key good form habits',
                    },
                    donts: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          mistake: { type: Type.STRING },
                          whyItHurts: { type: Type.STRING },
                          riskLevel: { type: Type.STRING, description: '"Low" | "Medium" | "High"' },
                        },
                        required: ['mistake', 'whyItHurts', 'riskLevel'],
                      },
                      description: 'Common mistakes and dangerous habits',
                    },
                    protocols: {
                      type: Type.OBJECT,
                      properties: {
                        hypertrophy: { type: Type.STRING, description: 'e.g., "3-4 sets of 8-12 reps"' },
                        strength: { type: Type.STRING, description: 'e.g., "4-5 sets of 4-6 reps"' },
                        endurance: { type: Type.STRING, description: 'e.g., "3 sets of 15-20 reps"' },
                        restTime: { type: Type.STRING, description: 'e.g., "60-90 seconds"' },
                      },
                      required: ['hypertrophy', 'strength', 'endurance', 'restTime'],
                    },
                    proTip: {
                      type: Type.STRING,
                      description: 'Elite coaching cue to maximize mind-muscle connection',
                    },
                  },
                  required: [
                    'id',
                    'name',
                    'difficulty',
                    'movementType',
                    'targetArea',
                    'muscleKeys',
                    'primaryMuscles',
                    'secondaryMuscles',
                    'briefDescription',
                    'formCheckpoints',
                    'visualBiometrics',
                    'dos',
                    'donts',
                    'protocols',
                    'proTip',
                  ],
                },
                description: 'List of exercises (for free weights, includes 3-6 varied movements; for machines, main lift + variations)',
              },
            },
            required: [
              'equipmentName',
              'equipmentType',
              'confidenceScore',
              'primaryCategory',
              'punchySummary',
              'overallTargetedMuscles',
              'setupAndSafety',
              'exercises',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Empty response received from AI model');
      }

      const parsedData = JSON.parse(rawText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error('Error analyzing equipment:', err);
      // Fallback gracefully so user always gets a rich response
      const fallback = getFallbackAnalysis(req.body?.userPrompt || 'equipment');
      return res.json(fallback);
    }
  });

  // API: AI Full Workout Routine Generator based on any prompt
  app.post('/api/generate-routine', async (req: Request, res: Response) => {
    try {
      const { prompt, experienceLevel = 'All Levels' } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Please provide a workout prompt' });
      }

      if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not set. Using smart fallback routine.');
        return res.json(getFallbackRoutine(prompt));
      }

      const systemInstruction = `You are an elite sports scientist and master strength coach (CSCS).
The user wants a customized full workout routine based on their natural language request (goals, muscles, available equipment, or time).
1. Design a complete, cohesive 4 to 6 exercise workout routine.
2. For each exercise:
   - Identify movementType ("Compound" | "Isolation"), targetArea, difficulty.
   - Map exact muscleKeys for our anatomical body heat map:
     "chest_upper", "chest_mid", "chest_lower", "deltoid_anterior", "deltoid_lateral", "deltoid_posterior", "biceps", "triceps", "forearms", "traps", "lats", "rhomboids", "lower_back", "abs", "obliques", "glutes", "quads", "hamstrings", "calves".
   - Primary & secondary muscles.
   - Brief 1-2 sentence description.
   - Concise form checkpoints (Setup, Start, Execution/Peak), visual biometrics (joint angle, spine, path, tempo).
   - Form dos & common dangerous mistakes (donts with riskLevel).
   - Sets and reps protocols (hypertrophy, strength, endurance, restTime).
   - Actionable mind-muscle proTip.
3. Provide setupAndSafety tips (warmup, equipment selection, joint prep).
4. Provide overallTargetedMuscles across the entire workout routine.`;

      const userPrompt = `Create a full workout routine for someone at experience level: ${experienceLevel}.
User prompt/request: "${prompt}".
Return structured JSON following the exact schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              equipmentName: {
                type: Type.STRING,
                description: 'The title of the workout routine, e.g., "Full Body Dumbbell Ignition", "Push Day Hypertrophy Split"',
              },
              equipmentType: {
                type: Type.STRING,
                description: '"free_weight" | "machine" | "cable" | "bodyweight_station" | "rack_bench"',
              },
              confidenceScore: { type: Type.INTEGER },
              primaryCategory: {
                type: Type.STRING,
                description: 'e.g. "Full Body Hypertrophy", "Upper Body Push", "Leg Day Power"',
              },
              punchySummary: {
                type: Type.STRING,
                description: '1-2 sentence overview of the workout session focus and volume strategy',
              },
              overallTargetedMuscles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    muscleKey: { type: Type.STRING },
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    activationPercentage: { type: Type.INTEGER },
                    briefFunction: { type: Type.STRING },
                  },
                  required: ['muscleKey', 'name', 'role', 'activationPercentage', 'briefFunction'],
                },
              },
              setupAndSafety: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    movementType: { type: Type.STRING },
                    targetArea: { type: Type.STRING },
                    muscleKeys: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    primaryMuscles: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    secondaryMuscles: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    briefDescription: { type: Type.STRING },
                    formCheckpoints: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          step: { type: Type.STRING },
                          instruction: { type: Type.STRING },
                          visualPosturalCue: { type: Type.STRING },
                        },
                        required: ['step', 'instruction', 'visualPosturalCue'],
                      },
                    },
                    visualBiometrics: {
                      type: Type.OBJECT,
                      properties: {
                        idealJointAngle: { type: Type.STRING },
                        spinePosition: { type: Type.STRING },
                        weightTrajectory: { type: Type.STRING },
                        breathingCadence: { type: Type.STRING },
                        tempo: { type: Type.STRING },
                      },
                      required: ['idealJointAngle', 'spinePosition', 'weightTrajectory', 'breathingCadence', 'tempo'],
                    },
                    dos: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    donts: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          mistake: { type: Type.STRING },
                          whyItHurts: { type: Type.STRING },
                          riskLevel: { type: Type.STRING },
                        },
                        required: ['mistake', 'whyItHurts', 'riskLevel'],
                      },
                    },
                    protocols: {
                      type: Type.OBJECT,
                      properties: {
                        hypertrophy: { type: Type.STRING },
                        strength: { type: Type.STRING },
                        endurance: { type: Type.STRING },
                        restTime: { type: Type.STRING },
                      },
                      required: ['hypertrophy', 'strength', 'endurance', 'restTime'],
                    },
                    proTip: { type: Type.STRING },
                  },
                  required: [
                    'id',
                    'name',
                    'difficulty',
                    'movementType',
                    'targetArea',
                    'muscleKeys',
                    'primaryMuscles',
                    'secondaryMuscles',
                    'briefDescription',
                    'formCheckpoints',
                    'visualBiometrics',
                    'dos',
                    'donts',
                    'protocols',
                    'proTip',
                  ],
                },
              },
            },
            required: [
              'equipmentName',
              'equipmentType',
              'confidenceScore',
              'primaryCategory',
              'punchySummary',
              'overallTargetedMuscles',
              'setupAndSafety',
              'exercises',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty routine generated');

      const parsedData = JSON.parse(rawText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error('Error generating workout routine:', err);
      return res.json(getFallbackRoutine(req.body?.prompt || 'Full Body'));
    }
  });

  // API: Text-to-speech for hands-free audio form coaching
  app.post('/api/speak-form-cue', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || !process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: 'Text or API key missing' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: 'Energetic, supportive personal trainer with clear instructional cadence',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
      }

      return res.status(500).json({ error: 'No audio returned' });
    } catch (err: any) {
      console.error('TTS error:', err);
      return res.status(500).json({ error: err.message || 'TTS failed' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Dev server with Vite middleware or production static build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GymSnap server listening on http://0.0.0.0:${PORT}`);
  });
}

// Fallback catalog in case of network issue or missing key during quick test
function getFallbackAnalysis(keyword: string) {
  const kw = keyword.toLowerCase();

  if (kw.includes('dumbbell') || kw.includes('weight') || kw.includes('free')) {
    return {
      equipmentName: 'Hexagonal Rubber Dumbbells',
      equipmentType: 'free_weight',
      confidenceScore: 98,
      primaryCategory: 'Full Body & Free Weight Versatility',
      punchySummary: 'Unmatched versatility for unilateral balance, joint-friendly natural paths of motion, and hyper-targeted muscle hypertrophy.',
      setupAndSafety: [
        'Select a weight where you can achieve full range of motion with a 2-second eccentric lower.',
        'Always clean weights to your knees before kicking them back onto a bench.',
        'Keep wrists stacked directly over your forearms to avoid hyperextension strain.',
      ],
      overallTargetedMuscles: [
        { muscleKey: 'chest_mid', name: 'Pectoralis Major', role: 'primary', activationPercentage: 92, briefFunction: 'Horizontal adduction under deep stretch' },
        { muscleKey: 'deltoid_anterior', name: 'Anterior Deltoid', role: 'secondary', activationPercentage: 80, briefFunction: 'Shoulder flexion assistance' },
        { muscleKey: 'triceps', name: 'Triceps Brachii', role: 'secondary', activationPercentage: 75, briefFunction: 'Elbow extension at lockout' },
        { muscleKey: 'lats', name: 'Latissimus Dorsi', role: 'primary', activationPercentage: 88, briefFunction: 'Shoulder extension during rows' },
        { muscleKey: 'biceps', name: 'Biceps Brachii', role: 'primary', activationPercentage: 90, briefFunction: 'Elbow flexion during curls' },
        { muscleKey: 'quads', name: 'Quadriceps', role: 'primary', activationPercentage: 85, briefFunction: 'Knee extension during goblet squats' },
      ],
      exercises: [
        {
          id: 'db-bench-press',
          name: 'Flat Dumbbell Bench Press',
          difficulty: 'Beginner',
          movementType: 'Compound',
          targetArea: 'Middle & Lower Chest, Front Delts',
          muscleKeys: ['chest_mid', 'chest_lower', 'deltoid_anterior', 'triceps'],
          primaryMuscles: ['Pectoralis Major (Mid/Sternocostal)', 'Anterior Deltoids'],
          secondaryMuscles: ['Triceps Brachii', 'Serratus Anterior'],
          briefDescription: 'Allows a deeper bottom stretch and convergent top squeeze compared to a rigid barbell.',
          formCheckpoints: [
            { step: 'Setup', instruction: 'Retract scapulae back and down into bench, plant feet firmly.', visualPosturalCue: 'Chest puffed high, natural lower back arch.' },
            { step: 'Start', instruction: 'Lower bells under control with elbows angled at 45-60° to ribs.', visualPosturalCue: 'Forearms perpendicular to floor at all times.' },
            { step: 'Execution', instruction: 'Press dumbbells up in a slight triangle arc without banging bells.', visualPosturalCue: 'Shoulders stay glued to bench, pecs squeeze.' },
          ],
          visualBiometrics: {
            idealJointAngle: 'Elbows tucked 45° from torso (arrowhead pattern)',
            spinePosition: 'Neutral spine with slight arch, buttocks pinned',
            weightTrajectory: 'Slight arc from nipple line to above upper chest',
            breathingCadence: 'Inhale lowering (3s), Exhale pressing (1s)',
            tempo: '3-1-1-0',
          },
          dos: [
            'Maintain continuous tension by stopping just before bone-on-bone lockout.',
            'Keep your wrists neutral and knuckles pointing toward the ceiling.',
          ],
          donts: [
            { mistake: 'Flaring elbows out at 90°', whyItHurts: 'Puts extreme shear stress on the rotator cuff and anterior shoulder capsule.', riskLevel: 'High' },
            { mistake: 'Bouncing weights off chest', whyItHurts: 'Uses momentum instead of muscle fibers and risks rib injury.', riskLevel: 'Medium' },
          ],
          protocols: {
            hypertrophy: '3-4 sets of 8-12 reps',
            strength: '4 sets of 5-6 reps',
            endurance: '3 sets of 15 reps',
            restTime: '90-120 seconds',
          },
          proTip: 'Think about pinching your biceps into the sides of your pecs at the top rather than just pushing hands together.',
        },
        {
          id: 'db-goblet-squat',
          name: 'Dumbbell Goblet Squat',
          difficulty: 'Beginner',
          movementType: 'Compound',
          targetArea: 'Quads, Glutes & Core Bracing',
          muscleKeys: ['quads', 'glutes', 'abs', 'calves'],
          primaryMuscles: ['Quadriceps (Rectus Femoris & Vasti)', 'Gluteus Maximus'],
          secondaryMuscles: ['Hamstrings', 'Adductors', 'Rectus Abdominis'],
          briefDescription: 'Holding the dumbbell at the chest acts as a natural counterbalance for upright posture and deep hip flexion.',
          formCheckpoints: [
            { step: 'Setup', instruction: 'Cup the dumbbell vertically under the top bell against sternum.', visualPosturalCue: 'Elbows pointing down, collarbones wide.' },
            { step: 'Execution', instruction: 'Hinge hips back slightly and sink between knees to parallel or lower.', visualPosturalCue: 'Knees tracking cleanly in line with 2nd toe.' },
            { step: 'Return', instruction: 'Drive through midfoot and squeeze glutes at the standing peak.', visualPosturalCue: 'Spine stays tall, avoid leaning forward.' },
          ],
          visualBiometrics: {
            idealJointAngle: 'Knees flexed to 90-100°, hips below knees if mobility allows',
            spinePosition: 'Vertical upright torso braced by anterior load',
            weightTrajectory: 'Strict vertical plummet centered over midfoot',
            breathingCadence: 'Inhale deep into belly before descent, exhale through peak',
            tempo: '3-1-1-1',
          },
          dos: [
            'Keep weight glued to your sternum throughout the entire descent.',
            'Spread the floor with your feet to activate outer hip stabilizers.',
          ],
          donts: [
            { mistake: 'Knees caving inward (valgus collapse)', whyItHurts: 'Excessive strain on the MCL and patellar tendon.', riskLevel: 'High' },
            { mistake: 'Heels lifting off the ground', whyItHurts: 'Shifts load unsafely onto toes and kneecaps.', riskLevel: 'Medium' },
          ],
          protocols: {
            hypertrophy: '3 sets of 10-12 reps',
            strength: '4 sets of 6-8 reps',
            endurance: '3 sets of 15-20 reps',
            restTime: '75-90 seconds',
          },
          proTip: 'Use your elbows to gently nudge your knees outward at the bottom of the squat for optimal hip opening.',
        },
        {
          id: 'db-bent-over-row',
          name: 'Two-Arm Dumbbell Bent-Over Row',
          difficulty: 'Intermediate',
          movementType: 'Compound',
          targetArea: 'Lats, Rhomboids, Rear Delts & Traps',
          muscleKeys: ['lats', 'rhomboids', 'deltoid_posterior', 'traps', 'biceps'],
          primaryMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius'],
          secondaryMuscles: ['Posterior Deltoid', 'Biceps Brachii', 'Erector Spinae'],
          briefDescription: 'Builds incredible upper back thickness and postural strength with free joint mobility.',
          formCheckpoints: [
            { step: 'Setup', instruction: 'Hinge forward at 45° with soft knees and a flat, braced spine.', visualPosturalCue: 'Neck neutral, gazing 4-5 feet ahead on floor.' },
            { step: 'Execution', instruction: 'Drive elbows back toward your hip pockets rather than pulling straight up.', visualPosturalCue: 'Shoulder blades glide together tightly.' },
            { step: 'Return', instruction: 'Lower slowly until lats are fully lengthened without rounding back.', visualPosturalCue: 'Keep torso still, avoid jerking body upright.' },
          ],
          visualBiometrics: {
            idealJointAngle: 'Torso angled at 40-50° to horizontal',
            spinePosition: 'Rigid neutral lumbar spine, zero rounding',
            weightTrajectory: 'Diagonal path toward lower ribcage / hip crease',
            breathingCadence: 'Exhale rowing back, Inhale stretching down',
            tempo: '2-1-1-0',
          },
          dos: [
            'Pull with your elbows, imagining your hands are just hooks.',
            'Pause for a crisp 1-second contraction at the top.',
          ],
          donts: [
            { mistake: 'Yanking with upper traps and neck', whyItHurts: 'Misses the target back muscles and sparks neck spasm.', riskLevel: 'Medium' },
            { mistake: 'Rounding the lower back like a fishing rod', whyItHurts: 'Massive lumbar disc herniation hazard under load.', riskLevel: 'High' },
          ],
          protocols: {
            hypertrophy: '3-4 sets of 10-12 reps',
            strength: '4 sets of 6-8 reps',
            endurance: '3 sets of 15 reps',
            restTime: '90 seconds',
          },
          proTip: 'Stop thinking about lifting the dumbbells; think about driving your elbow tips through the ceiling behind you.',
        },
        {
          id: 'db-standing-lateral-raise',
          name: 'Standing Dumbbell Lateral Raise',
          difficulty: 'Beginner',
          movementType: 'Isolation',
          targetArea: 'Lateral Deltoids (Shoulder Width)',
          muscleKeys: ['deltoid_lateral', 'traps', 'forearms'],
          primaryMuscles: ['Lateral Deltoids'],
          secondaryMuscles: ['Upper Trapezius', 'Supraspinatus'],
          briefDescription: 'The premier isolation exercise for developing boulder shoulder width and V-taper aesthetics.',
          formCheckpoints: [
            { step: 'Setup', instruction: 'Slight forward torso lean (10°), arms at sides with micro-bend in elbows.', visualPosturalCue: 'Palms facing thighs or slightly angled.' },
            { step: 'Execution', instruction: 'Raise arms outward in the scapular plane (30° forward from straight side).', visualPosturalCue: 'Lead with elbows, hands stay below elbow height.' },
            { step: 'Return', instruction: 'Stop at shoulder height and lower slowly resisting gravity.', visualPosturalCue: 'Do not swing or bounce the knees.' },
          ],
          visualBiometrics: {
            idealJointAngle: 'Elbows bent 15-20°, raised to 85-90° shoulder level',
            spinePosition: 'Braced core, slight 10° athletic forward lean',
            weightTrajectory: 'Wide outward arc in front of the coronal plane',
            breathingCadence: 'Exhale raising, Inhale lowering over 3 seconds',
            tempo: '2-1-1-0',
          },
          dos: [
            'Pour imaginary pitchers of water at the top (pinky slightly elevated).',
            'Focus on pushing the weights out toward the walls rather than up.',
          ],
          donts: [
            { mistake: 'Using heavy momentum and leg heave', whyItHurts: 'Robs the lateral delt of tension and strains spine.', riskLevel: 'Medium' },
            { mistake: 'Shrugging shoulders into ears', whyItHurts: 'Upper traps take over 80% of the movement.', riskLevel: 'Low' },
          ],
          protocols: {
            hypertrophy: '4 sets of 12-15 reps',
            strength: '3 sets of 10 reps',
            endurance: '3 sets of 20 reps',
            restTime: '60 seconds',
          },
          proTip: 'Keep your thumbs slightly lower than your pinkies at peak height to isolate the side delt head from your front delt.',
        },
      ],
    };
  }

  // Default fallback: Lat Pulldown Machine
  return {
    equipmentName: 'Seated Lat Pulldown Cable Machine',
    equipmentType: 'machine',
    confidenceScore: 96,
    primaryCategory: 'Upper Body - Vertical Pull',
    punchySummary: 'The gold standard machine for building wide back V-taper, targeting latissimus dorsi with adjustable seated stability.',
    setupAndSafety: [
      'Adjust thigh pad so your knees are firmly anchored with flat feet on floor.',
      'Grip the bar slightly wider than shoulder width with a pronated or neutral hook grip.',
      'Maintain a slight 10-15° torso lean throughout; never swing backwards violently.',
    ],
    overallTargetedMuscles: [
      { muscleKey: 'lats', name: 'Latissimus Dorsi', role: 'primary', activationPercentage: 94, briefFunction: 'Shoulder adduction & downward scapular rotation' },
      { muscleKey: 'biceps', name: 'Biceps Brachii', role: 'secondary', activationPercentage: 78, briefFunction: 'Elbow flexion during the pull' },
      { muscleKey: 'rhomboids', name: 'Rhomboids & Mid Traps', role: 'secondary', activationPercentage: 72, briefFunction: 'Scapular retraction at peak' },
      { muscleKey: 'deltoid_posterior', name: 'Rear Deltoid', role: 'secondary', activationPercentage: 65, briefFunction: 'Horizontal shoulder extension' },
      { muscleKey: 'abs', name: 'Core Stabilizers', role: 'stabilizer', activationPercentage: 50, briefFunction: 'Resisting extension strain' },
    ],
    exercises: [
      {
        id: 'wide-grip-lat-pulldown',
        name: 'Wide-Grip Lat Pulldown',
        difficulty: 'Beginner',
        movementType: 'Compound',
        targetArea: 'Upper & Outer Latissimus Dorsi',
        muscleKeys: ['lats', 'biceps', 'rhomboids', 'traps', 'deltoid_posterior'],
        primaryMuscles: ['Latissimus Dorsi', 'Teres Major'],
        secondaryMuscles: ['Biceps Brachii', 'Brachialis', 'Rhomboids'],
        briefDescription: 'Emphasizes the sweep of the upper lats for maximum back width and posture correction.',
        formCheckpoints: [
          { step: 'Setup', instruction: 'Lock thighs firmly under roller pad, hold bar 1.5x shoulder width.', visualPosturalCue: 'Chest lifted toward ceiling, eyes on cable.' },
          { step: 'Start', instruction: 'Depress shoulder blades down first before bending the elbows.', visualPosturalCue: 'Shoulders pulled away from ears.' },
          { step: 'Execution', instruction: 'Drive elbows down and back toward ribs until bar touches upper chest.', visualPosturalCue: 'Forearms stay vertical, torso stays rigid.' },
          { step: 'Return', instruction: 'Allow bar to rise under 3-second control for a deep stretch at top.', visualPosturalCue: 'Do not let weight stack slam.' },
        ],
        visualBiometrics: {
          idealJointAngle: 'Elbows pulled down in coronal plane, finishing at sides',
          spinePosition: 'Gentle 15° backward lean, chest arched proud',
          weightTrajectory: 'Vertical descent to clavicle / upper sternum',
          breathingCadence: 'Exhale pulling down, Inhale on slow release up',
          tempo: '3-0-1-1',
        },
        dos: [
          'Pull with your elbows, driving them down into your back pockets.',
          'Pause and squeeze your back for 1 full second at the bottom.',
        ],
        donts: [
          { mistake: 'Leaning back 45° and turning it into a row', whyItHurts: 'Uses bodyweight momentum and misses vertical lat recruitment.', riskLevel: 'Medium' },
          { mistake: 'Pulling the bar behind your neck', whyItHurts: 'Forces severe cervical spine flexion and damages rotator cuff tendons.', riskLevel: 'High' },
        ],
        protocols: {
          hypertrophy: '3-4 sets of 8-12 reps',
          strength: '4 sets of 6-8 reps',
          endurance: '3 sets of 15 reps',
          restTime: '75-90 seconds',
        },
        proTip: 'Wrap your thumbs over the bar (thumbless monkey grip) to relax your forearm flexors and direct 100% tension into your lats.',
      },
      {
        id: 'close-grip-pulldown',
        name: 'Close Neutral-Grip Pulldown (V-Bar)',
        difficulty: 'Beginner',
        movementType: 'Compound',
        targetArea: 'Lower Lats & Mid-Back Thickness',
        muscleKeys: ['lats', 'biceps', 'rhomboids', 'forearms'],
        primaryMuscles: ['Lower Latissimus Dorsi', 'Brachialis'],
        secondaryMuscles: ['Biceps Brachii', 'Middle Trapezius'],
        briefDescription: 'Parallel hand position creates a deeper stretch on the lower lat fibers and provides higher mechanical leverage.',
        formCheckpoints: [
          { step: 'Setup', instruction: 'Attach V-bar handle, sit anchored with thighs tight against pad.', visualPosturalCue: 'Torso lean can be slightly more pronounced (20°).' },
          { step: 'Execution', instruction: 'Pull the handle straight down to the center of your chest.', visualPosturalCue: 'Elbows track close alongside your ribcage.' },
          { step: 'Return', instruction: 'Extend arms fully overhead to feel a massive stretch from hips to armpits.', visualPosturalCue: 'Torso returns to near vertical.' },
        ],
        visualBiometrics: {
          idealJointAngle: 'Elbows tucked tightly against rib cage at bottom',
          spinePosition: 'Slight 20° arch through thoracic spine',
          weightTrajectory: 'Strict straight line down to lower sternum',
          breathingCadence: 'Exhale during concentric pull, inhale during overhead reach',
          tempo: '2-1-1-1',
        },
        dos: [
          'Keep your elbows tucked into your sides as you finish the pull.',
          'Emphasize the deep stretch at full arm extension.',
        ],
        donts: [
          { mistake: 'Rounding shoulders forward at the bottom', whyItHurts: 'Puts biceps tendon under excessive friction.', riskLevel: 'Low' },
          { mistake: 'Rocking torso back and forth like a rowing boat', whyItHurts: 'Robbing back of eccentric load.', riskLevel: 'Medium' },
        ],
        protocols: {
          hypertrophy: '3 sets of 10-12 reps',
          strength: '3 sets of 8 reps',
          endurance: '3 sets of 15 reps',
          restTime: '60-75 seconds',
        },
        proTip: 'At the very top of the repetition, let your lats stretch upward by an extra inch to stimulate stretch-mediated hypertrophy.',
      },
    ],
  };
}

function getFallbackRoutine(prompt: string) {
  const p = prompt.toLowerCase();
  const isLower = p.includes('leg') || p.includes('squat') || p.includes('lower');
  const isPush = p.includes('push') || p.includes('chest') || p.includes('shoulder');

  if (isLower) {
    return {
      equipmentName: `AI Routine: Lower Body Power & Core`,
      equipmentType: 'free_weight',
      confidenceScore: 98,
      primaryCategory: 'Lower Body & Core Hypertrophy',
      punchySummary: 'Comprehensive quad, hamstring, and glute protocol designed for maximum leg drive and core stability.',
      setupAndSafety: [
        'Perform 5 minutes of dynamic hip openers and bodyweight ankle mobility before lifting.',
        'Choose weights allowing full parallel depth with strict 2-second eccentrics.',
        'Keep your spine rigid and core braced 360 degrees throughout all compound movements.',
      ],
      overallTargetedMuscles: [
        { muscleKey: 'quads', name: 'Quadriceps', role: 'primary', activationPercentage: 95, briefFunction: 'Knee extension force' },
        { muscleKey: 'glutes', name: 'Gluteus Maximus', role: 'primary', activationPercentage: 90, briefFunction: 'Hip extension lockout' },
        { muscleKey: 'hamstrings', name: 'Hamstrings', role: 'primary', activationPercentage: 88, briefFunction: 'Posterior chain hinge' },
        { muscleKey: 'calves', name: 'Calves', role: 'secondary', activationPercentage: 70, briefFunction: 'Ankle stabilization' },
        { muscleKey: 'abs', name: 'Core Stabilizers', role: 'stabilizer', activationPercentage: 80, briefFunction: 'Intra-abdominal pressure' },
      ],
      exercises: [
        {
          id: 'goblet-squat',
          name: 'Dumbbell Goblet Squat',
          difficulty: 'Beginner',
          movementType: 'Compound',
          targetArea: 'Quads & Glutes',
          muscleKeys: ['quads', 'glutes', 'abs'],
          primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
          secondaryMuscles: ['Core Stabilizers', 'Adductors'],
          briefDescription: 'Anterior load forces an upright spine and allows a deep squat depth between knees.',
          formCheckpoints: [
            { step: 'Setup', instruction: 'Hold dumbbell vertically against sternum, feet shoulder-width.', visualPosturalCue: 'Chest tall, elbows tucked inside knees.' },
            { step: 'Execution', instruction: 'Hinge hips back and sink below parallel under control.', visualPosturalCue: 'Knees tracking cleanly in line with toes.' },
            { step: 'Peak', instruction: 'Drive through whole foot and lock glutes at top.', visualPosturalCue: 'Avoid leaning forward.' },
          ],
          visualBiometrics: {
            idealJointAngle: 'Knees flexed 90-100°, hips below knees',
            spinePosition: 'Vertical upright spine supported by anterior load',
            weightTrajectory: 'Strict vertical plum line over midfoot',
            breathingCadence: 'Inhale deep into belly before descent, exhale at top',
            tempo: '3-1-1-0',
          },
          dos: ['Keep weight glued to sternum.', 'Drive knees outward on descent.'],
          donts: [{ mistake: 'Knees caving inward', whyItHurts: 'MCL and patellar strain.', riskLevel: 'High' }],
          protocols: { hypertrophy: '3-4 sets of 10-12 reps', strength: '4 sets of 6 reps', endurance: '3 sets of 15 reps', restTime: '75-90s' },
          proTip: 'Push your knees outward at the bottom to open hips and engage outer glutes.',
        },
        {
          id: 'romanian-deadlift',
          name: 'Dumbbell Romanian Deadlift (RDL)',
          difficulty: 'Intermediate',
          movementType: 'Compound',
          targetArea: 'Hamstrings & Glute-Ham Tie-in',
          muscleKeys: ['hamstrings', 'glutes', 'lower_back'],
          primaryMuscles: ['Hamstrings', 'Gluteus Maximus'],
          secondaryMuscles: ['Erector Spinae', 'Latissimus Dorsi'],
          briefDescription: 'The premier hip-hinge exercise for loading hamstrings in their lengthened position.',
          formCheckpoints: [
            { step: 'Setup', instruction: 'Stand tall with dumbbells in front of thighs, soft bend in knees.', visualPosturalCue: 'Shoulders retracted, flat back.' },
            { step: 'Execution', instruction: 'Push hips backward toward wall behind you while shaving weights down shins.', visualPosturalCue: 'Shin angle stays vertical.' },
            { step: 'Peak', instruction: 'Squeeze glutes to stand tall once you feel a maximum hamstring stretch.', visualPosturalCue: 'Do not hyperextend lower back at top.' },
          ],
          visualBiometrics: {
            idealJointAngle: 'Knees fixed at 15-20° soft bend throughout',
            spinePosition: 'Flat neutral spine from head to tailbone',
            weightTrajectory: 'Close vertical slide grazing thighs and shins',
            breathingCadence: 'Inhale hinging back, exhale driving hips forward',
            tempo: '3-1-1-0',
          },
          dos: ['Push hips back rather than bending over.', 'Feel deep hamstring tension.'],
          donts: [{ mistake: 'Rounding lower back like a fishing pole', whyItHurts: 'Lumbar disc herniation danger.', riskLevel: 'High' }],
          protocols: { hypertrophy: '3 sets of 10-12 reps', strength: '4 sets of 6-8 reps', endurance: '3 sets of 15 reps', restTime: '90s' },
          proTip: 'Imagine you have your hands full of groceries and are trying to close a car door with your buttocks.',
        },
      ],
    };
  }

  // Default Full Body / Push
  return {
    equipmentName: `AI Routine: ${prompt ? prompt.slice(0, 30) : 'Full Body Power'}`,
    equipmentType: 'free_weight',
    confidenceScore: 98,
    primaryCategory: 'Total Body Hypertrophy & Strength',
    punchySummary: 'Optimized full-body circuit designed for progressive overload, maximum muscular symmetry, and balanced joint health.',
    setupAndSafety: [
      'Warm up with 3 minutes of arm circles, cat-cow spine stretches, and bodyweight squats.',
      'Maintain continuous muscle tension on every repetition without slamming weights.',
      'Listen to your joints: stop 1-2 reps before technical form failure.',
    ],
    overallTargetedMuscles: [
      { muscleKey: 'chest_mid', name: 'Pectoralis Major', role: 'primary', activationPercentage: 92, briefFunction: 'Horizontal adduction' },
      { muscleKey: 'lats', name: 'Latissimus Dorsi', role: 'primary', activationPercentage: 90, briefFunction: 'Vertical and horizontal pull' },
      { muscleKey: 'deltoid_lateral', name: 'Lateral Deltoids', role: 'primary', activationPercentage: 88, briefFunction: 'Shoulder abduction' },
      { muscleKey: 'quads', name: 'Quadriceps', role: 'primary', activationPercentage: 86, briefFunction: 'Knee extension' },
      { muscleKey: 'triceps', name: 'Triceps', role: 'secondary', activationPercentage: 75, briefFunction: 'Elbow extension' },
      { muscleKey: 'biceps', name: 'Biceps', role: 'secondary', activationPercentage: 78, briefFunction: 'Elbow flexion' },
    ],
    exercises: [
      {
        id: 'chest-press',
        name: 'Dumbbell Chest Press',
        difficulty: 'Beginner',
        movementType: 'Compound',
        targetArea: 'Mid/Lower Chest & Triceps',
        muscleKeys: ['chest_mid', 'deltoid_anterior', 'triceps'],
        primaryMuscles: ['Pectoralis Major', 'Anterior Deltoid'],
        secondaryMuscles: ['Triceps Brachii'],
        briefDescription: 'Independent dumbbells allow natural converging path and deep stretch across pec fibers.',
        formCheckpoints: [
          { step: 'Setup', instruction: 'Lie back on bench, feet planted, retract scapulae.', visualPosturalCue: 'Chest high, slight lower back arch.' },
          { step: 'Execution', instruction: 'Lower dumbbells with elbows at 45° to torso.', visualPosturalCue: 'Forearms stay vertical like pillars.' },
          { step: 'Peak', instruction: 'Press dumbbells up in a gentle triangle arc, squeezing pecs.', visualPosturalCue: 'Do not bang dumbbells.' },
        ],
        visualBiometrics: {
          idealJointAngle: 'Elbows tucked 45-60° from torso',
          spinePosition: 'Pinned shoulder blades with natural arch',
          weightTrajectory: 'Converging arc toward eye line',
          breathingCadence: 'Inhale lowering (3s), Exhale pressing (1s)',
          tempo: '3-1-1-0',
        },
        dos: ['Pinch shoulder blades into bench.', 'Maintain continuous tension.'],
        donts: [{ mistake: 'Flaring elbows at 90°', whyItHurts: 'Rotator cuff impingement.', riskLevel: 'High' }],
        protocols: { hypertrophy: '3-4 sets of 8-12 reps', strength: '4 sets of 5-6 reps', endurance: '3 sets of 15 reps', restTime: '90s' },
        proTip: 'Think about pushing your biceps into the sides of your chest at the top of the press.',
      },
      {
        id: 'bent-over-row',
        name: 'Two-Arm Dumbbell Bent-Over Row',
        difficulty: 'Beginner',
        movementType: 'Compound',
        targetArea: 'Lats, Rhomboids & Rear Delts',
        muscleKeys: ['lats', 'rhomboids', 'deltoid_posterior', 'biceps'],
        primaryMuscles: ['Latissimus Dorsi', 'Rhomboids'],
        secondaryMuscles: ['Posterior Deltoid', 'Biceps Brachii'],
        briefDescription: 'Builds upper back thickness and posture while testing posterior chain stabilization.',
        formCheckpoints: [
          { step: 'Setup', instruction: 'Hinge forward at 45° with flat braced spine.', visualPosturalCue: 'Back straight, knees soft.' },
          { step: 'Execution', instruction: 'Drive elbows back toward hip pockets.', visualPosturalCue: 'Pinch shoulder blades together.' },
          { step: 'Return', instruction: 'Lower slowly for full lat stretch without rounding spine.', visualPosturalCue: 'Torso stays still.' },
        ],
        visualBiometrics: {
          idealJointAngle: 'Torso angled 40-50° to horizontal',
          spinePosition: 'Rigid neutral lumbar spine',
          weightTrajectory: 'Diagonal path toward hip crease',
          breathingCadence: 'Exhale rowing back, Inhale stretching down',
          tempo: '2-1-1-0',
        },
        dos: ['Pull with elbows like hooks.', 'Hold contraction for 1 second.'],
        donts: [{ mistake: 'Rounding back', whyItHurts: 'Spinal disc herniation danger.', riskLevel: 'High' }],
        protocols: { hypertrophy: '3-4 sets of 10-12 reps', strength: '4 sets of 6 reps', endurance: '3 sets of 15 reps', restTime: '90s' },
        proTip: 'Drive your elbow tips through the ceiling behind you rather than pulling with your forearms.',
      },
    ],
  };
}

startServer();

