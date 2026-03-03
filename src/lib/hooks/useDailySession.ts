'use client';
import { useState, useCallback } from 'react';
import { Verb, DailyPlan, DailySession } from '@/types';
import { SessionHistoryRepository } from '@/lib/sr/SessionHistoryRepository';
import { SRLocalStorageRepository } from '@/lib/sr/SRRepository';

const historyRepo = new SessionHistoryRepository();
const srRepo = new SRLocalStorageRepository();

function getToday(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Santiago',
    }).format(new Date());
}

export function useDailySession() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getDailyPlan = useCallback(async (allVerbs: Verb[]): Promise<DailyPlan | null> => {
        const today = getToday();

        // ── CACHÉ: Si ya hay plan para hoy NO llamar a la IA ──
        const cached = historyRepo.getToday(today);
        if (cached && cached.verbsStudied.length > 0) {
            const verbObjects = cached.verbsStudied
                .map((inf) => allVerbs.find((v) => v.infinitive === inf))
                .filter(Boolean) as Verb[];

            return {
                verbs: verbObjects,
                attemptsPerVerb: cached.attemptsPerVerb,
                summary: cached.aiRecommendation,
                fromCache: true,  // ← indica que vino del caché
            };
        }

        // ── Solo llama a la IA si no hay plan para hoy ──
        setLoading(true);
        setError(null);
        try {
            const verbsProgress = Object.values(srRepo.getAll());
            const sessionHistory = historyRepo.getLast(7);
            const allInfinitives = allVerbs.map((v) => v.infinitive);

           const res = await fetch('/api/ai-daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verbsProgress,
                    sessionHistory,
                    allVerbs: allInfinitives,
                }),
            });

            if (!res.ok) {
                // Clonar antes de leer para no consumir el stream dos veces
                const text = await res.text();
                console.error('Error de la API:', res.status, text);
                throw new Error(`Error IA: ${res.status}`);
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            const selectedVerbs: Verb[] = [];
            const attemptsPerVerb: Record<string, number> = {};

            (data.verbs ?? []).forEach((item: { infinitive: string; timesToPractice: number }) => {
                const verb = allVerbs.find((v) => v.infinitive === item.infinitive);
                if (verb) {
                    selectedVerbs.push(verb);
                    attemptsPerVerb[item.infinitive] = Math.min(Math.max(item.timesToPractice, 2), 5);
                }
            });

            // ── Guardar en localStorage → fija el plan todo el día ──
            const session: DailySession = {
                date: today,
                verbsStudied: selectedVerbs.map((v) => v.infinitive),
                attemptsPerVerb,
                correct: 0,
                incorrect: 0,
                aiRecommendation: data.summary ?? '',
            };
            historyRepo.save(session);

            return {
                verbs: selectedVerbs,
                attemptsPerVerb,
                summary: data.summary ?? '',
                fromCache: false,
            };
        } catch (err) {
            console.error(err);
            setError('No se pudo conectar con la IA. Usando selección automática.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualiza correct/incorrect del día sin tocar los verbos elegidos
    const updateTodayStats = useCallback((correct: number, incorrect: number) => {
        const today = getToday();
        const session = historyRepo.getToday(today);
        if (session) {
            historyRepo.save({ ...session, correct, incorrect });
        }
    }, []);

    return { getDailyPlan, updateTodayStats, loading, error };
}