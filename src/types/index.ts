export interface Verb {
    infinitive: string;
    pastSimple: string;
    pastParticiple: string;
    spanish: string;
    SpanishPast: string;
    SpanishPastParticiple: string;
    explanation: string;
    imageUrl: string;
    prompimagen?: string;
}


export type Screen = 'start' | 'practice' | 'summary';

export type ExerciseType = 'write_forms' | 'translate_to_spanish' | 'match_translation';

export interface Exercise {
    type: ExerciseType;
    verb: Verb;
}

export interface SessionStats {
    correct: number;
    incorrect: number;
    verbsWithErrors: Verb[];
}

export interface MatchingPair {
    english: string;
    spanish: string;
}

export interface PerformanceZone {
    zone: 'red' | 'yellow' | 'green';
    percentage: number;
}
export interface DailySession {
    date: string;                             // YYYY-MM-DD
    verbsStudied: string[];                   // infinitivos
    attemptsPerVerb: Record<string, number>;  // { "break": 3 }
    correct: number;
    incorrect: number;
    aiRecommendation: string;
}

export interface DailyPlan {
    verbs: Verb[];
    attemptsPerVerb: Record<string, number>;
    summary: string;
    fromCache: boolean;
}