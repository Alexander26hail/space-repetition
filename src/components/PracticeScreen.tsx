'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Verb, ExerciseType } from '@/types';
import { createMatchingPairs, shuffleArray, checkMatch } from '@/lib/matchingUtils';
import { MatchingPair } from '@/types';
import { isEnglishFormCorrect } from '@/lib/exerciseUtils';


interface PracticeScreenProps {
    verb: Verb;
    exerciseType: ExerciseType;
    current: number;
    total: number;
    onCheck: (answers: {
        infinitive?: string;
        pastSimple?: string;
        pastParticiple?: string;
        translation?: string;
    }) => boolean;
    onNext: () => void;
    onExit: () => void;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({
    verb,
    exerciseType,
    current,
    total,
    onCheck,
    onNext,
    onExit,
}) => {
    const [infinitive, setInfinitive] = useState('');
    const [pastSimple, setPastSimple] = useState('');
    const [pastParticiple, setPastParticiple] = useState('');
    const [translation, setTranslation] = useState('');
    const [pairs, setPairs] = useState<MatchingPair[]>([]);
    const [shuffledSpanish, setShuffledSpanish] = useState<{ text: string; originalIndex: number }[]>([]);
    const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);const [selectedSpanish, setSelectedSpanish] = useState<string | null>(null);
    const [matchedPairs, setMatchedPairs] = useState<MatchingPair[]>([]);
    const [matchFeedback, setMatchFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
    const [checked, setChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctionMode, setCorrectionMode] = useState(false);

    const [selectedEnglishIdx, setSelectedEnglishIdx] = useState<number | null>(null);
    const [matchedIndices, setMatchedIndices] = useState<Set<number>>(new Set());
    const [selectedSpanishIdx, setSelectedSpanishIdx] = useState<number | null>(null);
    
    
    // Refs para foco automático
    const firstInputRef = useRef<HTMLInputElement>(null);
    const translationInputRef = useRef<HTMLInputElement>(null);
    const nextBtnRef = useRef<HTMLButtonElement>(null);
    const correctionBtnRef = useRef<HTMLButtonElement>(null);

    const canAdvance = checked && isCorrect && !correctionMode;
    // Reset y foco al cambiar ejercicio
    useEffect(() => {
        setInfinitive('');
        setPastSimple('');
        setPastParticiple('');
        setTranslation('');
        setChecked(false);
        setIsCorrect(false);
        setCorrectionMode(false);

        if (exerciseType === 'match_translation') {
            const newPairs = createMatchingPairs(verb);
            setPairs(newPairs);
            // Guardamos índice original para identificar el par correcto
            const spanishWithIdx = newPairs.map((p, i) => ({ text: p.spanish, originalIndex: i }));
            // Mezclar
            const shuffled = [...spanishWithIdx].sort(() => Math.random() - 0.5);
            setShuffledSpanish(shuffled);
            setSelectedEnglishIdx(null);
            setSelectedSpanishIdx(null);
            setMatchedIndices(new Set());
            setMatchFeedback(null);
        } else {
            setTimeout(() => {
                if (exerciseType === 'write_forms') firstInputRef.current?.focus();
                else if (exerciseType === 'translate_to_spanish') translationInputRef.current?.focus();
            }, 50);
        }
    }, [verb, exerciseType]);

    // Foco automático cuando cambia el estado
    useEffect(() => {
        if (canAdvance) {
            nextBtnRef.current?.focus();
        } else if (correctionMode) {
            correctionBtnRef.current?.focus();
            if (exerciseType === 'write_forms') firstInputRef.current?.focus();
            else if (exerciseType === 'translate_to_spanish') translationInputRef.current?.focus();
        }
    }, [canAdvance, correctionMode]);
    // ─── Lógica principal de Enter ───────────────────────────────────────
    // Un solo handler global de teclado para Enter y Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onExit();
                return;
            }

            if (e.key !== 'Enter') return;

            // No interferir si estamos dentro de un input (se maneja localmente)
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            // Si puede avanzar → siguiente
            if (canAdvance) {
                onNext();
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canAdvance, onNext, onExit]);

    // ─── Handlers Write Forms ────────────────────────────────────────────
    const handleCheckWriteForms = () => {
        const result = onCheck({ infinitive, pastSimple, pastParticiple });
        setIsCorrect(result);
        setChecked(true);
        if (!result) {
            setCorrectionMode(true);
        }
    };

   const handleCorrectionWriteForms = () => {
    const ok =
        isEnglishFormCorrect(infinitive, verb.infinitive) &&
        isEnglishFormCorrect(pastSimple, verb.pastSimple) &&
        isEnglishFormCorrect(pastParticiple, verb.pastParticiple);

    if (ok) {
        setCorrectionMode(false);
        setIsCorrect(true);
    }
};

    // Enter en inputs de write_forms: avanza al siguiente campo o revisa/confirma
    const handleWriteFormsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldIndex: number) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        if (canAdvance) { onNext(); return; }

        if (!checked && !correctionMode) {
            if (fieldIndex < 2) {
                // Avanzar al siguiente input
                const inputs = document.querySelectorAll<HTMLInputElement>('.write-form-input');
                inputs[fieldIndex + 1]?.focus();
            } else {
                // Último campo → revisar
                handleCheckWriteForms();
            }
            return;
        }

        if (correctionMode) {
            handleCorrectionWriteForms();
        }
    };

    // ─── Handlers Translation ────────────────────────────────────────────
    const handleCheckTranslation = () => {
        const result = onCheck({ translation });
        setIsCorrect(result);
        setChecked(true);
        if (!result) {
            setCorrectionMode(true);
            setTranslation('');
        }
    };

    const handleCorrectionTranslation = () => {
        const result = onCheck({ translation });
        if (result) {
            setCorrectionMode(false);
            setIsCorrect(true);
        }
    };

    const handleTranslationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        if (canAdvance) { onNext(); return; }
        if (!checked) { handleCheckTranslation(); return; }
        if (correctionMode) { handleCorrectionTranslation(); }
    };

    // ─── Handlers Matching ───────────────────────────────────────────────
    const handleWordClick = (word: string, side: 'english' | 'spanish') => {
        if (matchedPairs.some((p) => p.english === word || p.spanish === word)) return;
        if (side === 'english') setSelectedEnglish((prev) => (prev === word ? null : word));
        else setSelectedSpanish((prev) => (prev === word ? null : word));
    };
    const handleEnglishClick = (idx: number) => {
        if (matchedIndices.has(idx)) return;
        setSelectedEnglishIdx((prev) => (prev === idx ? null : idx));
    };

    const handleSpanishClick = (originalIndex: number) => {
        if (matchedIndices.has(originalIndex)) return;
        setSelectedSpanishIdx((prev) => (prev === originalIndex ? null : originalIndex));
    };

    useEffect(() => {
        if (selectedEnglishIdx === null || selectedSpanishIdx === null) return;

        // El par es correcto si apuntan al mismo índice
        const isMatch = selectedEnglishIdx === selectedSpanishIdx;

        if (isMatch) {
            const newMatched = new Set(matchedIndices).add(selectedEnglishIdx);
            setMatchedIndices(newMatched);
            setMatchFeedback({ msg: '✅ ¡Correcto!', ok: true });
            setSelectedEnglishIdx(null);
            setSelectedSpanishIdx(null);

            if (newMatched.size === pairs.length) {
                setChecked(true);
                setIsCorrect(true);
                onCheck({});
            }
        } else {
            setMatchFeedback({ msg: '❌ No coinciden. Intenta de nuevo.', ok: false });
            setTimeout(() => {
                setSelectedEnglishIdx(null);
                setSelectedSpanishIdx(null);
                setMatchFeedback(null);
            }, 1000);
        }
    }, [selectedEnglishIdx, selectedSpanishIdx]);

  

    const wordClass = (word: string, side: 'english' | 'spanish') => {
        const isMatched = matchedPairs.some((p) => p[side] === word);
        const isSelected = side === 'english' ? selectedEnglish === word : selectedSpanish === word;
        return [
            'px-4 py-2 rounded-lg border-2 font-medium text-sm cursor-pointer transition-all',
            isMatched
                ? 'border-green-500 bg-green-100 text-green-700 cursor-default'
                : isSelected
                ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50',
        ].join(' ');
    };

    return (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
            <div className="p-6 sm:p-8">
                {/* Header con botón home integrado */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onExit}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100 flex-shrink-0"
                            title="Volver al inicio (Esc)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                            {exerciseType === 'write_forms' && 'Escribe las formas'}
                            {exerciseType === 'translate_to_spanish' && 'Traduce al español'}
                            {exerciseType === 'match_translation' && 'Conecta las palabras'}
                        </h1>
                    </div>
                    <div className="font-bold text-indigo-600 bg-indigo-100 rounded-full px-4 py-1 text-sm flex-shrink-0">
                        {current} / {total}
                    </div>
                </div>

                {/* Imagen */}
               <div className="mb-4 flex justify-center">
                    <img
                        src={verb.imageUrl}
                        alt={`Representación de ${verb.infinitive}`}
                        className="rounded-lg object-contain max-h-48 w-auto"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://placehold.co/400x400/e2e8f0/475569?text=Imagen+no+disponible';
                        }}
                    />
                </div>

                {/* Info verbo */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 text-center">
                    {exerciseType === 'write_forms' && (
                        <>
                            <p className="text-lg text-slate-600">Escribe las 3 formas del verbo:</p>
                            <p className="text-3xl font-bold text-indigo-600">{verb.spanish}</p>
                        </>
                    )}
                    {exerciseType === 'translate_to_spanish' && (
                        <>
                            <p className="text-lg text-slate-600">Traduce al español:</p>
                            <p className="text-3xl font-bold text-indigo-600">{verb.infinitive}</p>
                        </>
                    )}
                    {exerciseType === 'match_translation' && (
                        <>
                            <p className="text-lg text-slate-600">Conecta cada forma con su traducción:</p>
                            <p className="text-3xl font-bold text-indigo-600">{verb.spanish}</p>
                        </>
                    )}
                    <p className="text-slate-500 text-sm mt-2 italic px-4">{verb.explanation}</p>
                </div>

                {/* ── WRITE FORMS ── */}
                {exerciseType === 'write_forms' && (
                    <div className="space-y-4">
                        {[
                            { label: 'Infinitive',      value: infinitive,      setValue: setInfinitive,      correct: verb.infinitive,      idx: 0, ref: firstInputRef },
                            { label: 'Past Simple',     value: pastSimple,      setValue: setPastSimple,      correct: verb.pastSimple,      idx: 1, ref: null },
                            { label: 'Past Participle', value: pastParticiple,  setValue: setPastParticiple,  correct: verb.pastParticiple,  idx: 2, ref: null },
                        ].map(({ label, value, setValue, correct, idx, ref }) => {
                            // ← NUEVO: evaluar cada campo individualmente
                            const isFieldCorrect = checked
                                ? isEnglishFormCorrect(value, correct)
                                : null;

                            return (
                                <div key={label}>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                                    <input
                                        ref={ref}
                                        type="text"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        disabled={canAdvance}
                                        className={[
                                            'write-form-input w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50',
                                            // ← NUEVO: colorear el input según resultado
                                            checked && isFieldCorrect  ? 'border-green-500 bg-green-50'  : '',
                                            checked && !isFieldCorrect ? 'border-red-500 bg-red-50'    : '',
                                            !checked                   ? 'border-slate-300'              : '',
                                        ].join(' ')}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        onKeyDown={(e) => handleWriteFormsKeyDown(e, idx)}
                                    />
                                    {/* ← NUEVO: mostrar ✓ o ✗ por campo */}
                                    {checked && isFieldCorrect && (
                                        <p className="text-sm text-green-700 mt-1 font-semibold">✓ {correct}</p>
                                    )}
                                    {checked && !isFieldCorrect && (
                                        <p className="text-sm text-red-600 mt-1 font-semibold">✗ Error: {correct}</p>
                                    )}
                                </div>
                            );
                        })}

                        <div className="mt-4 flex flex-col gap-3">
                            {!checked && (
                                <button
                                    onClick={handleCheckWriteForms}
                                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Revisar <span className="text-indigo-200 text-xs ml-1">(Enter en último campo)</span>
                                </button>
                            )}
                            {correctionMode && (
                                <button
                                    ref={correctionBtnRef}
                                    onClick={handleCorrectionWriteForms}
                                    className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Confirmar corrección <span className="text-amber-200 text-xs ml-1">(Enter)</span>
                                </button>
                            )}
                            {canAdvance && (
                                <button
                                    ref={nextBtnRef}
                                    onClick={onNext}
                                    className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    Siguiente → <span className="text-slate-300 text-xs ml-1">(Enter)</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TRANSLATE TO SPANISH ── */}
                {exerciseType === 'translate_to_spanish' && (
                    <div>
                        <input
                            ref={translationInputRef}
                            type="text"
                            value={translation}
                            onChange={(e) => setTranslation(e.target.value)}
                            disabled={canAdvance}
                            placeholder="Escribe la traducción..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            onKeyDown={handleTranslationKeyDown}
                        />

                       
                        {checked && isCorrect && !correctionMode && (
                            <p className="text-sm text-green-700 mt-2 font-semibold">
                                ✓ Correcto: {verb.spanish}
                            </p>
                        )}
                        {checked && !isCorrect && (
                            <p className="text-sm text-red-600 mt-2 font-semibold">
                                ✗ Error: {verb.spanish}
                            </p>
                        )}

                        {checked && (
                            <div className={`mt-4 text-center font-medium p-3 rounded-lg ${isCorrect && !correctionMode ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isCorrect && !correctionMode
                                    ? '¡Correcto!'
                                    : correctionMode
                                    ? '❌ Incorrecto. Escribe la traducción correcta para continuar.'
                                    : '❌ Incorrecto'}
                            </div>
                        )}

                        <div className="mt-4 flex flex-col gap-3">
                            {!checked && (
                                <button
                                    onClick={handleCheckTranslation}
                                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Revisar <span className="text-indigo-200 text-xs ml-1">(Enter)</span>
                                </button>
                            )}
                            {correctionMode && (
                                <button
                                    ref={correctionBtnRef}
                                    onClick={handleCorrectionTranslation}
                                    className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Confirmar corrección <span className="text-amber-200 text-xs ml-1">(Enter)</span>
                                </button>
                            )}
                            {canAdvance && (
                                <button
                                    ref={nextBtnRef}
                                    onClick={onNext}
                                    className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    Siguiente → <span className="text-slate-300 text-xs ml-1">(Enter)</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── MATCHING ── */}
                {exerciseType === 'match_translation' && (
                    <div>
                        <p className="text-center text-slate-600 mb-4 text-sm">
                            Selecciona una palabra en inglés y su traducción en español
                        </p>

                        <div className="flex gap-4 justify-center">
                            {/* Columna inglés */}
                            <div className="flex flex-col gap-3 flex-1">
                                <p className="text-xs font-bold text-slate-500 text-center uppercase">Inglés</p>
                                {pairs.map((p, idx) => {
                                    const isMatched = matchedIndices.has(idx);
                                    const isSelected = selectedEnglishIdx === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleEnglishClick(idx)}
                                            disabled={isMatched}
                                            className={[
                                                'px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all',
                                                isMatched
                                                    ? 'border-green-500 bg-green-100 text-green-700 cursor-default'
                                                    : isSelected
                                                    ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                                                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer',
                                            ].join(' ')}
                                        >
                                            {p.english}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Columna español — mezclada */}
                            <div className="flex flex-col gap-3 flex-1">
                                <p className="text-xs font-bold text-slate-500 text-center uppercase">Español</p>
                                {shuffledSpanish.map((item) => {
                                    const isMatched = matchedIndices.has(item.originalIndex);
                                    const isSelected = selectedSpanishIdx === item.originalIndex;
                                    return (
                                        <button
                                            key={item.originalIndex}
                                            onClick={() => handleSpanishClick(item.originalIndex)}
                                            disabled={isMatched}
                                            className={[
                                                'px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all',
                                                isMatched
                                                    ? 'border-green-500 bg-green-100 text-green-700 cursor-default'
                                                    : isSelected
                                                    ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                                                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer',
                                            ].join(' ')}
                                        >
                                            {item.text}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Progreso */}
                        <div className="mt-4 text-center text-sm text-slate-500">
                            {matchedIndices.size} / {pairs.length} pares encontrados
                        </div>

                        {matchFeedback && (
                            <div className={`mt-3 text-center font-medium p-2 rounded-lg text-sm ${matchFeedback.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {matchFeedback.msg}
                            </div>
                        )}

                        {canAdvance && (
                            <>
                                <div className="mt-4 text-center font-medium p-3 rounded-lg bg-green-100 text-green-700">
                                    ¡Todos los pares encontrados! 🎉
                                </div>
                                <button
                                    ref={nextBtnRef}
                                    onClick={onNext}
                                    className="mt-4 w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    Siguiente → <span className="text-slate-300 text-xs ml-1">(Enter)</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticeScreen;