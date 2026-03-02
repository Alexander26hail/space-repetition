import { Verb, MatchingPair } from '@/types';

export function createMatchingPairs(verb: Verb): MatchingPair[] {
    return [
        { english: verb.infinitive, spanish: verb.spanish },
        { english: verb.pastSimple, spanish: verb.SpanishPast },
        { english: verb.pastParticiple, spanish: verb.SpanishPastParticiple },
    ];
}

export function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function checkMatch(selectedEnglish: string, selectedSpanish: string, pairs: MatchingPair[]): boolean {
    return pairs.some(
        (pair) => pair.english === selectedEnglish && pair.spanish === selectedSpanish
    );
}