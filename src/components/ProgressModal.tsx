'use client';
import React from 'react';
import { useSpacedRepetition } from '@/lib/hooks/useSpacedRepetition';
import { Verb } from '@/types';

interface ProgressModalProps {
    allVerbs: Verb[];
    onClose: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ allVerbs, onClose }) => {
    const { globalStats, getVerbProgress } = useSpacedRepetition();

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {/* Header con botón volver */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100 flex-shrink-0"
                    title="Volver"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-slate-800">📊 Mi Progreso</h1>
            </div>

            {/* Stats globales */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center bg-green-50 rounded-xl p-3 border border-green-100">
                    <p className="text-2xl font-bold text-green-600">{globalStats.mastered}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Dominados</p>
                </div>
                <div className="text-center bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <p className="text-2xl font-bold text-amber-500">{globalStats.learning}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Aprendiendo</p>
                </div>
                <div className="text-center bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                    <p className="text-2xl font-bold text-indigo-600">{globalStats.dueToday}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Para hoy</p>
                </div>
            </div>

            {/* Lista de verbos */}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Detalle por verbo
            </p>
            <ul className="space-y-2">
                {allVerbs.map((verb) => {
                    const p = getVerbProgress(verb.infinitive);
                    const isMastered = p.interval >= 21;
                    const isNew = p.repetitions === 0;
                    const isLearning = !isNew && !isMastered;
                    const accuracy =
                        p.totalCorrect + p.totalIncorrect > 0
                            ? Math.round((p.totalCorrect / (p.totalCorrect + p.totalIncorrect)) * 100)
                            : null;

                    // Colores de la tarjeta según progreso
                    const cardClass = isMastered
                        ? 'bg-green-50 border-green-200'
                        : isLearning
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-50 border-slate-100';

                    const verbNameClass = isMastered
                        ? 'text-green-700'
                        : isLearning
                        ? 'text-amber-700'
                        : 'text-slate-700';

                    // Barra de progreso: basada en el intervalo (máx referencia 21 días)
                    const progressPercent = isMastered
                        ? 100
                        : isNew
                        ? 0
                        : Math.min(Math.round((p.interval / 21) * 100), 99);

                    const barClass = isMastered
                        ? 'bg-green-400'
                        : isLearning && progressPercent >= 50
                        ? 'bg-amber-400'
                        : 'bg-amber-300';

                    return (
                        <li
                            key={verb.infinitive}
                            className={`flex flex-col rounded-xl px-4 py-3 border ${cardClass}`}
                        >
                            {/* Fila principal */}
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1 mr-3">
                                    <p className={`font-bold text-sm truncate ${verbNameClass}`}>{verb.infinitive}</p>
                                    <p className="text-xs text-slate-400 truncate">{verb.spanish}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-0.5 flex-shrink-0">
                                    {isNew ? (
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">🆕 Nuevo</span>
                                    ) : isMastered ? (
                                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">⭐ Dominado</span>
                                    ) : (
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">📖 Aprendiendo</span>
                                    )}
                                    {accuracy !== null && (
                                        <span className="text-xs text-slate-400">{accuracy}% acierto</span>
                                    )}
                                    {!isNew && (
                                        <span className="text-xs text-slate-400">
                                            {p.interval <= 1 ? 'revisión mañana' : `revisión en ${p.interval}d`}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Barra de progreso */}
                            {!isNew && (
                                <div className="mt-2">
                                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-500 ${barClass}`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ProgressModal;