import { ISRAlgorithm, VerbProgress } from './types';

const MIN_EASE_FACTOR = 1.3;

// Intervalos cortos para aprendizaje inicial (en minutos)
const WRONG_REVIEW_MINUTES = 5;
const FIRST_CORRECT_MINUTES = 10;

export class SM2Algorithm implements ISRAlgorithm {
    calculate(prev: VerbProgress, isCorrect: boolean): Partial<VerbProgress> {
        const quality = isCorrect ? 4 : 1;
        let { easeFactor, interval, repetitions } = prev;
        const MAX_INTERVAL = 35;
        const now = new Date();
        let nextReviewDate: Date;

        if (quality < 3) {
            // Respuesta incorrecta → revisar en 5 minutos
            repetitions = 0;
            interval = 0;
            nextReviewDate = new Date(now.getTime() + WRONG_REVIEW_MINUTES * 60 * 1000);
        } else {
            if (repetitions === 0) {
                // Primera respuesta correcta → revisar en 10 minutos
                interval = 0;
                nextReviewDate = new Date(now.getTime() + FIRST_CORRECT_MINUTES * 60 * 1000);
            } else if (repetitions === 1) {
                interval = 1;
                nextReviewDate = new Date(now);
                nextReviewDate.setDate(nextReviewDate.getDate() + 1);
            } else if (repetitions === 2) {
                interval = 6;
                nextReviewDate = new Date(now);
                nextReviewDate.setDate(nextReviewDate.getDate() + 6);
            } else {
                interval = Math.min(Math.round(interval * easeFactor), MAX_INTERVAL);                nextReviewDate = new Date(now);
                nextReviewDate.setDate(nextReviewDate.getDate() + interval);
            }
            repetitions += 1;
        }

        easeFactor = Math.max(
            MIN_EASE_FACTOR,
            easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        return {
            easeFactor: parseFloat(easeFactor.toFixed(2)),
            interval,
            repetitions,
            nextReview: nextReviewDate.toISOString(),
            lastReview: now.toISOString(),
        };
    }
}