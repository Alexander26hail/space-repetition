import { ISRAlgorithm, ISRRepository, ISRService, SRGlobalStats, VerbProgress } from './types';

export class SRService implements ISRService {
    constructor(
        private readonly repo: ISRRepository,
        private readonly algorithm: ISRAlgorithm
    ) {}

    update(infinitive: string, isCorrect: boolean): VerbProgress {
        const prev = this.repo.get(infinitive);
        const updates = this.algorithm.calculate(prev, isCorrect);

        const updated: VerbProgress = {
            ...prev,
            ...updates,
            totalCorrect:   prev.totalCorrect   + (isCorrect ? 1 : 0),
            totalIncorrect: prev.totalIncorrect + (isCorrect ? 0 : 1),
        };

        this.repo.save(updated);
        return updated;
    }

    getProgress(infinitive: string): VerbProgress {
        return this.repo.get(infinitive);
    }

    getDueVerbs(allInfinitives: string[], count: number): string[] {
        const now = new Date().toISOString();
        const all = this.repo.getAll();

        const due: VerbProgress[] = [];
        const newVerbs: string[] = [];

        allInfinitives.forEach((inf) => {
            const p = all[inf];
            if (!p)                    newVerbs.push(inf);
            else if (p.nextReview <= now) due.push(p);
        });

        const sortedDue = due
            .sort((a, b) => a.nextReview.localeCompare(b.nextReview))
            .map((p) => p.infinitive);

        return [...sortedDue, ...this.shuffle(newVerbs)].slice(0, count);
    }

    getGlobalStats(): SRGlobalStats {
        const all = Object.values(this.repo.getAll());
        const now = new Date().toISOString();

        return {
            totalStudied: all.length,
            dueToday:     all.filter((p) => p.nextReview <= now).length,
            mastered:     all.filter((p) => p.interval >= 21).length,
            learning:     all.filter((p) => p.interval < 21 && p.repetitions > 0).length,
            newVerbs:     all.filter((p) => p.repetitions === 0).length,
        };
    }

    private shuffle<T>(arr: T[]): T[] {
        return [...arr].sort(() => Math.random() - 0.5);
    }
}