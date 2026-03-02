import { Verb, Exercise, ExerciseType } from '@/types';
import { EXERCISE_TYPES } from './constants';

export function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function createMixedQuestionDeck(verbs: Verb[], attemptsPer: number): Exercise[] {
    const deck: Exercise[] = [];

    verbs.forEach((verb) => {
        const typesForVerb: ExerciseType[] = [];

        if (attemptsPer >= 3) {
            typesForVerb.push(
                EXERCISE_TYPES.WRITE_FORMS,
                EXERCISE_TYPES.TRANSLATE_TO_SPANISH,
                EXERCISE_TYPES.MATCH_TRANSLATION
            );
            for (let i = 3; i < attemptsPer; i++) {
                const r = Math.random();
                if (r < 1 / 3) typesForVerb.push(EXERCISE_TYPES.WRITE_FORMS);
                else if (r < 2 / 3) typesForVerb.push(EXERCISE_TYPES.TRANSLATE_TO_SPANISH);
                else typesForVerb.push(EXERCISE_TYPES.MATCH_TRANSLATION);
            }
        } else {
            const cycle: ExerciseType[] = [
                EXERCISE_TYPES.WRITE_FORMS,
                EXERCISE_TYPES.TRANSLATE_TO_SPANISH,
            ];
            for (let i = 0; i < attemptsPer; i++) {
                typesForVerb.push(cycle[i % cycle.length]);
            }
        }

        typesForVerb.forEach((type) => {
            deck.push({ type, verb });
        });
    });

    return shuffleArray(deck);
}

export function createMixedReinforcementDeck(verbs: Verb[], attemptsPer: number): Exercise[] {
    const deck: Exercise[] = [];

    verbs.forEach((verb) => {
        for (let i = 0; i < attemptsPer; i++) {
            if (i < Math.floor(attemptsPer / 2)) {
                deck.push({ type: EXERCISE_TYPES.WRITE_FORMS, verb });
            } else {
                deck.push({ type: EXERCISE_TYPES.TRANSLATE_TO_SPANISH, verb });
            }
        }
    });

    return deck;
}

function removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extractMainWords(text: string): string[] {
    const stopWords = ['de', 'la', 'el', 'en', 'a', 'se', 'un', 'una', 'con', 'por'];
    return text
        .split(/[\s\/,]+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 3 && !stopWords.includes(w));
}

export function isSpanishTranslationCorrect(userInput: string, correctSpanish: string): boolean {
    const normalizedUser = userInput.toLowerCase().trim();
    const normalizedCorrect = correctSpanish.toLowerCase();

    if (normalizedUser === normalizedCorrect) return true;

    const userNoAccents = removeAccents(normalizedUser);
    const correctNoAccents = removeAccents(normalizedCorrect);

    if (userNoAccents === correctNoAccents) return true;

    if (correctNoAccents.includes(userNoAccents) && userNoAccents.length >= 3) return true;

    const correctWithoutParentheses = correctNoAccents.replace(/\([^)]*\)/g, '').trim();
    if (userNoAccents === correctWithoutParentheses) return true;

    const mainWords = extractMainWords(correctNoAccents);
    return mainWords.some((word) => word === userNoAccents || userNoAccents.includes(word));
}