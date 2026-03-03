'use client';
import React, { useEffect, useState } from 'react';
import { SessionStats } from '@/types';
import { useSpacedRepetition } from '@/lib/hooks/useSpacedRepetition';
import { AIRecommendation } from '@/lib/sr/types';

interface SummaryScreenProps {
    stats: SessionStats;
    onGoToStart: () => void;
    onReinforce: () => void;
}

function formatMinutes(minutes: number): string {
    if (minutes < 60)   return `${minutes} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} horas`;
    return `${Math.round(minutes / 1440)} días`;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ stats, onGoToStart, onReinforce }) => {
    const { getVerbProgress, globalStats, getAIRecommendation } = useSpacedRepetition();
    const [aiRecs, setAiRecs] = useState<Record<string, AIRecommendation>>({});
    const [loadingAI, setLoadingAI] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoadingAI(true);
            const errorInfinitives = stats.verbsWithErrors.map((v) => v.infinitive);
            const results: Record<string, AIRecommendation> = {};

            for (const verb of stats.verbsWithErrors) {
                results[verb.infinitive] = await getAIRecommendation(verb.infinitive, errorInfinitives);
            }

            setAiRecs(results);
            setLoadingAI(false);
        };

        if (stats.verbsWithErrors.length > 0) fetchAll();
        else setLoadingAI(false);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">¡Sesión Completada!</h1>
            <p className="text-slate-500 mb-6">Este es el resumen de tu rendimiento de hoy.</p>

            {/* Stats sesión */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
                    <p className="text-slate-600 text-sm">Correctas</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-red-600">{stats.incorrect}</p>
                    <p className="text-slate-600 text-sm">Incorrectas</p>
                </div>
            </div>

            {/* Panel SR global */}
            <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
                <p className="text-sm font-bold text-indigo-700 mb-3">📊 Tu progreso SR</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-xl font-bold text-green-600">{globalStats.mastered}</p>
                        <p className="text-xs text-slate-500">Dominados</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-amber-500">{globalStats.learning}</p>
                        <p className="text-xs text-slate-500">Aprendiendo</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-blue-500">{globalStats.dueToday}</p>
                        <p className="text-xs text-slate-500">Para hoy</p>
                    </div>
                </div>
            </div>

            {/* Recomendaciones IA */}
            {stats.verbsWithErrors.length > 0 && (
                <div className="mb-6 text-left">
                    <p className="text-sm font-bold text-slate-600 mb-2">🤖 Recomendaciones IA</p>

                    {loadingAI ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm p-3 bg-slate-50 rounded-lg">
                            <span className="animate-spin inline-block">⏳</span>
                            Analizando tu progreso...
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {stats.verbsWithErrors.map((verb) => {
                                const progress = getVerbProgress(verb.infinitive);
                                const rec      = aiRecs[verb.infinitive];
                                const color    = rec?.difficulty === 'hard'   ? 'bg-red-50 border-red-100'
                                               : rec?.difficulty === 'medium' ? 'bg-amber-50 border-amber-100'
                                               :                                 'bg-green-50 border-green-100';
                                return (
                                    <li key={verb.infinitive} className={`rounded-xl px-4 py-3 border ${color}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-700">{verb.infinitive}</span>
                                            {rec && (
                                                <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded-full border border-indigo-100">
                                                    ⏱ en {formatMinutes(rec.nextReviewMinutes)}
                                                </span>
                                            )}
                                        </div>
                                        {rec?.reason && (
                                            <p className="text-xs text-slate-500 mt-1 italic">🤖 {rec.reason}</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            SM-2: {progress.interval <= 1 ? 'mañana' : `en ${progress.interval} días`}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* Próximas revisiones */}
            <div className="mb-6 text-left">
                <p className="text-sm font-bold text-slate-600 mb-1">✅ Próximas revisiones:</p>
                <p className="text-xs text-slate-400">
                    Mañana tendrás{' '}
                    <span className="font-bold text-indigo-600">{globalStats.dueToday}</span> verbos para revisar
                </p>
            </div>

            {/* Botones */}
            <div className="space-y-3">
                {stats.verbsWithErrors.length > 0 && (
                    <button onClick={onReinforce} className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 transition-colors">
                        Reforzar Verbos con Errores
                    </button>
                )}
                <button onClick={onGoToStart} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Volver al Inicio
                </button>
            </div>

            <p className="mt-4 text-slate-500 text-sm">¡Sigue así! Vuelve mañana para una nueva sesión.</p>
        </div>
    );
};

export default SummaryScreen;