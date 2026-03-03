'use client';
import React from 'react';
import { Verb } from '@/types';
import { useSpacedRepetition } from '@/lib/hooks/useSpacedRepetition';



interface StartScreenProps {
    dailyVerbs: Verb[];
    attemptsPerVerb: number;
    onStart: () => void;
    onRefresh: () => void;
    onIncreaseAttempts: () => void;
    onDecreaseAttempts: () => void;
    onShowProgress: () => void;
    aiSummary?: string;
    aiError?: string | null;
}

const SESSION_MIN = 2;
const SESSION_MAX = 8;

function getDifficultyLabel(attempts: number) {
    if (attempts <= 3) return { label: 'Fácil', color: 'text-emerald-600' };
    if (attempts <= 5) return { label: 'Normal', color: 'text-indigo-600' };
    if (attempts <= 7) return { label: 'Difícil', color: 'text-amber-600' };
    return { label: 'Experto', color: 'text-red-600' };
}

const StartScreen: React.FC<StartScreenProps> = ({
    dailyVerbs,
    attemptsPerVerb,
    onStart,
    onRefresh,
    onIncreaseAttempts,
    onDecreaseAttempts,
    onShowProgress,
    aiSummary,
    aiError,
}) => {
    const { getVerbProgress } = useSpacedRepetition();
    const totalQuestions = dailyVerbs.length * attemptsPerVerb;
    const progressWidth = `${((attemptsPerVerb - SESSION_MIN) / (SESSION_MAX - SESSION_MIN)) * 100}%`;
    const difficulty = getDifficultyLabel(attemptsPerVerb);

    // Fecha de hoy en español
    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-1">
                    Entrenador de Verbos
                </h1>
                <p className="text-slate-500 text-sm">
                    Aprende 6 verbos nuevos cada día. ¿Listo para empezar?
                </p>
            </div>

            {/* Fecha + título verbos */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-base font-semibold text-indigo-600">
                        Verbos de hoy
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{today}</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                    {dailyVerbs.length} verbos
                </span>
            </div>

            {/* Lista de verbos — tarjetas */}
            <ul className="space-y-2 mb-6">

                {dailyVerbs.map((verb, index) => {
                    const progress = getVerbProgress(verb.infinitive);
                    const isNew      = progress.repetitions === 0;
                    const isMastered = progress.interval >= 21;

                    return (
                       <li
                        key={verb.infinitive}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                    >
                        {/* Número */}
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                        </span>

                        {/* Formas del verbo */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                                <span className="font-bold text-slate-800 text-sm">
                                    {verb.infinitive}
                                </span>
                                <span className="text-slate-300 text-xs">•</span>
                                <span className="text-slate-500 text-sm">{verb.pastSimple}</span>
                                <span className="text-slate-300 text-xs">•</span>
                                <span className="text-slate-500 text-sm">{verb.pastParticiple}</span>
                            </div>
                        </div>

                        {/* Traducción */}
                        <span className="flex-shrink-0 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                            {verb.spanish}
                        </span>
                    </li>
                    );
                })}

                
            </ul>

            {/* Control de intentos */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">
                        Preguntas por verbo:
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-indigo-600">
                            {attemptsPerVerb}
                        </span>
                        <span className={`text-xs font-semibold ${difficulty.color}`}>
                            · {difficulty.label}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Botón disminuir */}
                    <button
                        onClick={onDecreaseAttempts}
                        disabled={attemptsPerVerb <= SESSION_MIN}
                        className="w-9 h-9 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-full flex items-center justify-center border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>

                    {/* Barra de progreso */}
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Fácil</span>
                            <span>Normal</span>
                            <span>Difícil</span>
                            <span>Experto</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-2 bg-indigo-500 rounded-full transition-all duration-300"
                                style={{ width: progressWidth }}
                            />
                        </div>
                        <p className="text-center text-xs font-semibold text-slate-500 mt-1">
                            {totalQuestions} preguntas totales
                        </p>
                    </div>

                    {/* Botón aumentar */}
                    <button
                        onClick={onIncreaseAttempts}
                        disabled={attemptsPerVerb >= SESSION_MAX}
                        className="w-9 h-9 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-full flex items-center justify-center border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col gap-3">
                <button
                    onClick={onStart}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 text-base transition-colors"
                >
                    Comenzar Sesión · {totalQuestions} preguntas
                </button>

                {/* Solo el botón — el modal se maneja en page.tsx */}
                <button
                    onClick={onShowProgress}
                    className="w-full bg-slate-100 text-slate-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-200 text-sm transition-colors flex items-center justify-center gap-2"
                >
                    📊 Ver mi progreso
                </button>
                {/* ← ELIMINAR el <div className="relative"> y el {showProgress && <ProgressModal.../>} */}

                <button
                    onClick={onRefresh}
                    className="w-full bg-slate-100 text-slate-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-200 text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    Refrescar verbos
                </button>
            </div>

            {/* Mensaje IA */}
            {aiSummary && !aiError && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mt-4 flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">🤖</span>
                    <p className="text-xs text-indigo-700">{aiSummary}</p>
                </div>
            )}
            {aiError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-4 flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">⚠️</span>
                    <p className="text-xs text-amber-700">{aiError}</p>
                </div>
            )}

            
        </div>
    );
};

export default StartScreen;