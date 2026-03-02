'use client';
import React, { useState, useEffect } from 'react';
import StartScreen from '@/components/StartScreen';
import PracticeScreen from '@/components/PracticeScreen';
import SummaryScreen from '@/components/SummaryScreen';
import { Verb, Screen, SessionStats, Exercise } from '@/types';
import { getDailyVerbs, getPerformanceZone, getReinforcementAttempts } from '@/lib/verbUtils';
import { createMixedQuestionDeck, createMixedReinforcementDeck, isSpanishTranslationCorrect } from '@/lib/exerciseUtils';
import { SESSION_CONFIG, UI_CONFIG } from '@/lib/constants';
import { useSpacedRepetition } from '@/lib/hooks/useSpacedRepetition';

export default function HomePage() {
    const [screen, setScreen] = useState<Screen>('start');
    const [allVerbs, setAllVerbs] = useState<Verb[]>([]);
    const [dailyVerbs, setDailyVerbs] = useState<Verb[]>([]);
    const [attemptsPerVerb, setAttemptsPerVerb] = useState<number>(SESSION_CONFIG.ATTEMPTS_PER_VERB_DEFAULT);
    const [questionDeck, setQuestionDeck] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SessionStats>({
        correct: 0,
        incorrect: 0,
        verbsWithErrors: [],
    });
    const [showExitModal, setShowExitModal] = useState(false);
    const { getDailyVerbsSR, recordAnswer } = useSpacedRepetition();

    useEffect(() => {
        fetch(process.env.NEXT_PUBLIC_API_URL!)
            .then((res) => res.json())
            .then((data: Verb[]) => {
                setAllVerbs(data);
                const srVerbs = getDailyVerbsSR(data);
                setDailyVerbs(srVerbs.length > 0 ? srVerbs : getDailyVerbs(data));
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error cargando verbos:', err);
                setLoading(false);
            });
    }, []);

    const currentExercise = questionDeck[currentIndex];
    const currentVerb = currentExercise?.verb;
    

    const handleCheck = (answers: {
        infinitive?: string;
        pastSimple?: string;
        pastParticiple?: string;
        translation?: string;
    }): boolean => {
        if (!currentVerb || !currentExercise) return false;

        let isCorrect = false;

        if (currentExercise.type === 'write_forms') {
            isCorrect =
                (answers.infinitive?.trim().toLowerCase() ?? '') === currentVerb.infinitive.toLowerCase() &&
                (answers.pastSimple?.trim().toLowerCase() ?? '') === currentVerb.pastSimple.toLowerCase() &&
                (answers.pastParticiple?.trim().toLowerCase() ?? '') === currentVerb.pastParticiple.toLowerCase();
        } else if (currentExercise.type === 'translate_to_spanish') {
            isCorrect = isSpanishTranslationCorrect(answers.translation ?? '', currentVerb.spanish);
        }

        if (currentExercise.type !== 'match_translation') {
            recordAnswer(currentVerb.infinitive, isCorrect);
        }

        setStats((prev) => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            verbsWithErrors: isCorrect
                ? prev.verbsWithErrors
                : [
                      ...prev.verbsWithErrors.filter((v) => v.infinitive !== currentVerb.infinitive),
                      currentVerb,
                  ],
        }));

        return isCorrect;
    };

    const handleNext = () => {
        if (currentIndex + 1 >= questionDeck.length) {
            setScreen('summary');
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleStart = () => {
        const deck = createMixedQuestionDeck(dailyVerbs, attemptsPerVerb);
        setQuestionDeck(deck);
        setCurrentIndex(0);
        setStats({ correct: 0, incorrect: 0, verbsWithErrors: [] });
        setScreen('practice');
    };

    const handleRefresh = () => {
        const shuffled = [...allVerbs].sort(() => Math.random() - 0.5);
        setDailyVerbs(shuffled.slice(0, UI_CONFIG.DAILY_VERBS_COUNT));
    };

    const handleReinforce = () => {
        const zone = getPerformanceZone(stats.correct, stats.correct + stats.incorrect);
        const attempts = getReinforcementAttempts(zone);
        const deck = createMixedReinforcementDeck(stats.verbsWithErrors, attempts);
        setQuestionDeck(deck);
        setDailyVerbs(stats.verbsWithErrors);
        setStats({ correct: 0, incorrect: 0, verbsWithErrors: [] });
        setScreen('start');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-slate-500 text-lg">Cargando verbos...</p>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto relative">
            {screen === 'start' && (
                <StartScreen
                    dailyVerbs={dailyVerbs}
                    attemptsPerVerb={attemptsPerVerb}
                    onStart={handleStart}
                    onRefresh={handleRefresh}
                    onIncreaseAttempts={() => setAttemptsPerVerb((p) => Math.min(p + 1, SESSION_CONFIG.MAX_ATTEMPTS))}
                    onDecreaseAttempts={() => setAttemptsPerVerb((p) => Math.max(p - 1, SESSION_CONFIG.MIN_ATTEMPTS))}
                />
            )}

            {screen === 'practice' && currentVerb && currentExercise && (
                <>
                    <PracticeScreen
                        verb={currentVerb}
                        exerciseType={currentExercise.type}
                        current={currentIndex + 1}
                        total={questionDeck.length}
                        onCheck={handleCheck}
                        onNext={handleNext}
                        onExit={() => setShowExitModal(true)}
                    />

                    {showExitModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full text-center">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">
                                    ¿Salir de la sesión?
                                </h3>
                                <p className="text-slate-600 mb-6">
                                    Tu progreso en esta sesión se perderá.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setShowExitModal(false)}
                                        className="w-full font-bold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => { setShowExitModal(false); setScreen('start'); }}
                                        className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700"
                                    >
                                        Sí, Salir
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {screen === 'summary' && (
                <SummaryScreen
                    stats={stats}
                    onGoToStart={() => setScreen('start')}
                    onReinforce={handleReinforce}
                />
            )}
        </div>
    );
}