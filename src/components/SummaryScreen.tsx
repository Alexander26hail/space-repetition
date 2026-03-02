'use client';
import React from 'react';
import { SessionStats } from '@/types';

interface SummaryScreenProps {
    stats: SessionStats;
    onGoToStart: () => void;
    onReinforce: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ stats, onGoToStart, onReinforce }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
                ¡Sesión Completada!
            </h1>
            <p className="text-slate-500 mb-6">
                Este es el resumen de tu rendimiento de hoy.
            </p>

            <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
                    <p className="text-slate-600">Respuestas correctas</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-red-600">{stats.incorrect}</p>
                    <p className="text-slate-600">Respuestas incorrectas</p>
                </div>
            </div>

            <div className="mt-8 space-y-4">
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