import { ISRAlgorithm, VerbProgress } from './types';

const MIN_EASE_FACTOR = 1.3;

export class SM2Algorithm implements ISRAlgorithm {
    calculate(prev: VerbProgress, isCorrect: boolean): Partial<VerbProgress> {
        const quality = isCorrect ? 4 : 1;
        let { easeFactor, interval, repetitions } = prev;

        if (quality >= 3) {
            if (repetitions === 0)      interval = 1;
            else if (repetitions === 1) interval = 6;
            else                        interval = Math.round(interval * easeFactor);
            repetitions += 1;
        } else {
            repetitions = 0;
            interval = 1;
        }

        easeFactor = Math.max(
            MIN_EASE_FACTOR,
            easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        return {
            easeFactor: parseFloat(easeFactor.toFixed(2)),
            interval,
            repetitions,
            nextReview: nextReview.toISOString().split('T')[0],
            lastReview: new Date().toISOString().split('T')[0],
        };
    }
}