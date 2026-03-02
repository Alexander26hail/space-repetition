'use client';
import React from 'react';
import { SessionStats } from '@/types';
import { useSpacedRepetition } from '@/lib/hooks/useSpacedRepetition';

interface SummaryScreenProps {
    stats: SessionStats;
    onGoToStart: () => void;
    onReinforce: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ stats, onGoToStart, onReinforce }) => {
    const { getVerbProgress, globalStats } = useSpacedRepetition();

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">¡Sesión Completada!</h1>
            <p className="text-slate-500 mb-6">Este es el resumen de tu rendimiento de hoy.</p>

            {/* Stats de sesión */}
            <div className="space-y-3 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
                    <p className="text-slate-600">Respuestas correctas</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-red-600">{stats.incorrect}</p>
                    <p className="text-slate-600">Respuestas incorrectas</p>
                </div>
            </div>

            {/* ── Panel SR ── */}
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
                        <p className="text-xl font-bold text-blue-500">{globalStats.newVerbs}</p>
                        <p className="text-xs text-slate-500">Nuevos</p>
                    </div>
                </div>
            </div>

            {/* Próximas revisiones por verbo */}
            {stats.verbsWithErrors.length > 0 && (
                <div className="mb-6 text-left">
                    <p className="text-sm font-bold text-slate-600 mb-2">🔄 Verbos a reforzar:</p>
                    <ul className="space-y-1">
                        {stats.verbsWithErrors.map((verb) => {
                            const progress = getVerbProgress(verb.infinitive);
                            return (
                                <li key={verb.infinitive} className="flex justify-between items-center bg-red-50 rounded-lg px-3 py-2 text-sm">
                                    <span className="font-semibold text-slate-700">{verb.infinitive}</span>
                                    <span className="text-xs text-red-500 font-medium">
                                        📅 Revisión en {progress.interval === 1 ? 'mañana' : `${progress.interval} días`}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Verbos correctos con su próxima revisión */}
            <div className="mb-6 text-left">
                <p className="text-sm font-bold text-slate-600 mb-2">✅ Próximas revisiones:</p>
                <p className="text-xs text-slate-400">
                    Mañana tendrás <span className="font-bold text-indigo-600">{globalStats.dueToday + 1}</span> verbos para revisar
                </p>
            </div>

            {/* Botones */}
            <div className="space-y-3">
                {stats.verbsWithErrors.length > 0 && (
                    <button
                        onClick={onReinforce}
                        className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 transition-colors text-lg"
                    >
                        Reforzar Verbos con Errores
                    </button>
                )}
                <button
                    onClick={onGoToStart}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-lg"
                >
                    Volver al Inicio
                </button>
            </div>

            <p className="mt-4 text-slate-500 text-sm">
                ¡Sigue así! Vuelve mañana para una nueva sesión de verbos.
            </p>
        </div>
    );
};

export default SummaryScreen;