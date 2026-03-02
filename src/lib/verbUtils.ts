import { Verb } from '@/types';
import { UI_CONFIG, LOCAL_STORAGE_KEYS } from './constants';

function getChileDate(): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    return formatter.format(new Date()).replace(/\//g, '-');
}

export function getDailyVerbs(allVerbs: Verb[]): Verb[] {
    if (typeof window === 'undefined') return allVerbs.slice(0, UI_CONFIG.DAILY_VERBS_COUNT);

    const today = getChileDate();
    const savedDay = localStorage.getItem(LOCAL_STORAGE_KEYS.VERB_DAY);
    const savedVerbs = localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_VERBS);

    // Si ya hay verbos guardados para hoy, usarlos
    if (savedDay === today && savedVerbs) {
        try {
            const parsed: Verb[] = JSON.parse(savedVerbs);
            if (parsed.length > 0) return parsed;
        } catch {
            // fallback a generar nuevos
        }
    }

    // Generar nuevos verbos del día
    const shuffled = [...allVerbs].sort(() => Math.random() - 0.5);
    const daily = shuffled.slice(0, UI_CONFIG.DAILY_VERBS_COUNT);

    localStorage.setItem(LOCAL_STORAGE_KEYS.VERB_DAY, today);
    localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_VERBS, JSON.stringify(daily));
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_CHECK, today);

    return daily;
}

export function getPerformanceZone(correct: number, total: number): 'red' | 'yellow' | 'green' {
    if (total === 0) return 'green';
    const percentage = (correct / total) * 100;
    if (percentage <= 50) return 'red';
    if (percentage <= 80) return 'yellow';
    return 'green';
}

export function getReinforcementAttempts(zone: 'red' | 'yellow' | 'green'): number {
    if (zone === 'red') return 3;
    if (zone === 'yellow') return 2;
    return 1;
}