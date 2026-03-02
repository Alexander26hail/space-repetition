import { ISRRepository, VerbProgress } from './types';

const SR_KEY = 'sr_verb_progress';

export class SRLocalStorageRepository implements ISRRepository {
    getAll(): Record<string, VerbProgress> {
        if (typeof window === 'undefined') return {};
        try {
            return JSON.parse(localStorage.getItem(SR_KEY) ?? '{}');
        } catch {
            return {};
        }
    }

    get(infinitive: string): VerbProgress {
        const all = this.getAll();
        return all[infinitive] ?? this.createDefault(infinitive);
    }

    save(progress: VerbProgress): void {
        const all = this.getAll();
        all[progress.infinitive] = progress;
        localStorage.setItem(SR_KEY, JSON.stringify(all));
    }

    private createDefault(infinitive: string): VerbProgress {
        return {
            infinitive,
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReview: new Date().toISOString().split('T')[0],
            lastReview: '',
            totalCorrect: 0,
            totalIncorrect: 0,
        };
    }
}