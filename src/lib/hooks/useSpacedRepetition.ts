import { useMemo, useCallback } from 'react';
import { SM2Algorithm } from '@/lib/sr/SM2Algorithm';
import { SRLocalStorageRepository } from '@/lib/sr/SRRepository';
import { SRService } from '@/lib/sr/SRService';
import { AIRecommendation, VerbProgress } from '@/lib/sr/types';
import { Verb } from '@/types';
import { UI_CONFIG } from '@/lib/constants';

let srServiceInstance: SRService | null = null;

function getSRService(): SRService {
    if (!srServiceInstance) {
        srServiceInstance = new SRService(
            new SRLocalStorageRepository(),
            new SM2Algorithm()
        );
    }
    return srServiceInstance;
}

export function useSpacedRepetition() {
    const srService = useMemo(() => getSRService(), []);

    const getDailyVerbsSR = (allVerbs: Verb[]): Verb[] => {
        const dueInfinitives = srService.getDueVerbs(
            allVerbs.map((v) => v.infinitive),
            UI_CONFIG.DAILY_VERBS_COUNT
        );
        return dueInfinitives
            .map((inf) => allVerbs.find((v) => v.infinitive === inf))
            .filter(Boolean) as Verb[];
    };

    const recordAnswer = (infinitive: string, isCorrect: boolean): VerbProgress => {
        return srService.update(infinitive, isCorrect);
    };

    const getVerbProgress = (infinitive: string): VerbProgress => {
        return srService.getProgress(infinitive);
    };

    // ← NUEVO: consulta IA al final de sesión
    const getAIRecommendation = useCallback(async (
        infinitive: string,
        sessionErrors: string[]
    ): Promise<AIRecommendation> => {
        const progress = srService.getProgress(infinitive);

        try {
            const res = await fetch('/api/sr-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress, sessionErrors }),
            });

            if (!res.ok) throw new Error('API error');

            const recommendation: AIRecommendation = await res.json();

            // Persistir recomendación IA en localStorage
            const stored = JSON.parse(localStorage.getItem('sr_verb_progress') ?? '{}');
            if (stored[infinitive]) {
                stored[infinitive].aiNextReviewMinutes = recommendation.nextReviewMinutes;
                stored[infinitive].aiReason            = recommendation.reason;
                stored[infinitive].aiLastUpdated       = new Date().toISOString();
                localStorage.setItem('sr_verb_progress', JSON.stringify(stored));
            }

            return recommendation;
        } catch {
            return { nextReviewMinutes: 60, reason: 'Revisión estándar', difficulty: 'medium', focusAreas: [] };
        }
    }, [srService]);

    const globalStats = srService.getGlobalStats();

    return { getDailyVerbsSR, recordAnswer, getVerbProgress, globalStats, getAIRecommendation };
}