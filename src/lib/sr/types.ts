export interface VerbProgress {
    infinitive: string;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: string;   // ISO date YYYY-MM-DD
    lastReview: string;
    totalCorrect: number;
    totalIncorrect: number;
    aiNextReviewMinutes?: number;  
    aiReason?: string;             
    aiLastUpdated?: string; 
}

// ─── Interface del algoritmo (abierto a extensión) ────────────────────────────
export interface ISRAlgorithm {
    calculate(prev: VerbProgress, isCorrect: boolean): Partial<VerbProgress>;
}

// ─── Interface del repositorio (inversión de dependencias) ───────────────────
export interface ISRRepository {
    get(infinitive: string): VerbProgress;
    save(progress: VerbProgress): void;
    getAll(): Record<string, VerbProgress>;
}

// ─── Interface del servicio ──────────────────────────────────────────────────
export interface ISRService {
    update(infinitive: string, isCorrect: boolean): VerbProgress;
    getDueVerbs(allInfinitives: string[], count: number): string[];
    getProgress(infinitive: string): VerbProgress;
    getGlobalStats(): SRGlobalStats;
}

export interface SRGlobalStats {
    totalStudied: number;
    dueToday: number;
    mastered: number;    // interval >= 21 días
    learning: number;
    newVerbs: number;
}
export interface AIRecommendation {
    nextReviewMinutes: number;  // 5, 10, 30, 60, 120, 1440 (1 día), etc.
    reason: string;
    difficulty: 'easy' | 'medium' | 'hard';
    focusAreas: string[];
}