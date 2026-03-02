import { useMemo } from 'react';
import { SM2Algorithm } from '@/lib/sr/SM2Algorithm';
import { SRLocalStorageRepository } from '@/lib/sr/SRRepository';
import { SRService } from '@/lib/sr/SRService';
import { Verb } from '@/types';
import { UI_CONFIG } from '@/lib/constants';

// Singleton del servicio — se crea una vez por sesión
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

    const recordAnswer = (infinitive: string, isCorrect: boolean) => {
        return srService.update(infinitive, isCorrect);
    };

    const getVerbProgress = (infinitive: string) => {
        return srService.getProgress(infinitive);
    };

    const globalStats = srService.getGlobalStats();

    return { getDailyVerbsSR, recordAnswer, getVerbProgress, globalStats };
}