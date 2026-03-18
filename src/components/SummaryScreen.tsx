'use client';
import React from 'react';
import { SessionStats } from '@/types';
import { useSpacedRepetition } from '@/lib/hooks/useSpacedRepetition';

interface SummaryScreenProps {
    stats: SessionStats;
    onGoToStart: () => void;
    onReinforce: () => void;
}

function formatRelativeTime(isoString: string): string {
    const diff = new Date(isoString).getTime() - Date.now();
    const minutes = Math.round(diff / 60000);
    if (minutes < 1)    return 'ahora';
    if (minutes < 60)   return `${minutes} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
    return `${Math.round(minutes / 1440)} días`;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ stats, onGoToStart, onReinforce }) => {
    const { getVerbProgress, globalStats } = useSpacedRepetition();

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

            {/* Verbos estudiados con próxima revisión */}
            {stats.verbsStudied.length > 0 && (
                <div className="mb-6 text-left">
                    <p className="text-sm font-bold text-slate-600 mb-2">📚 Verbos de esta sesión</p>
                    <ul className="space-y-2">
                        {stats.verbsStudied.map((verb) => {
                            const wasWrong = stats.verbsWithErrors.some((v) => v.infinitive === verb.infinitive);
                            const progress = getVerbProgress(verb.infinitive);
                            const nextTime  = formatRelativeTime(progress.nextReview);

                            return (
                                <li
                                    key={verb.infinitive}
                                    className={`rounded-xl px-4 py-3 border flex items-center justify-between ${
                                        wasWrong
                                            ? 'bg-red-50 border-red-100'
                                            : 'bg-green-50 border-green-100'
                                    }`}
                                >
                                    <div>
                                        <span className="font-bold text-slate-700 text-sm">{verb.infinitive}</span>
                                        <span className="text-slate-400 text-xs ml-2">· {verb.spanish}</span>
                                    </div>
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${
                                            wasWrong
                                                ? 'bg-white text-red-500 border-red-200'
                                                : 'bg-white text-green-600 border-green-200'
                                        }`}
                                    >
                                        {wasWrong ? '✗' : '✓'} en {nextTime}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Próximas revisiones */}
            <div className="mb-6 text-left">
                <p className="text-sm font-bold text-slate-600 mb-1">⏰ Próximas revisiones:</p>
                <p className="text-xs text-slate-400">
                    Hay{' '}
                    <span className="font-bold text-indigo-600">{globalStats.dueToday}</span> verbos pendientes ahora mismo
                </p>
            </div>

            {/* Botones */}
            <div className="space-y-3">
                {stats.verbsWithErrors.length > 0 && (
                    <button onClick={onReinforce} className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 transition-colors">
                        Reforzar verbos con errores
                    </button>
                )}
                <button onClick={onGoToStart} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Guardar y volver al inicio
                </button>
            </div>
        </div>
    );
};

export default SummaryScreen;