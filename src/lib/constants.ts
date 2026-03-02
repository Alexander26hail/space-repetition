export const SESSION_CONFIG = {
    ATTEMPTS_PER_VERB_DEFAULT: 4,
    REINFORCE_ATTEMPTS_RED: 3,
    REINFORCE_ATTEMPTS_YELLOW: 2,
    MIN_ATTEMPTS: 2,
    MAX_ATTEMPTS: 8,
    NOTIFICATION_DURATION: 3000,
    ATTEMPTS_NOTIFICATION_DURATION: 2000,
} as const;

export const EXERCISE_TYPES = {
    WRITE_FORMS: 'write_forms',
    TRANSLATE_TO_SPANISH: 'translate_to_spanish',
    MATCH_TRANSLATION: 'match_translation',
} as const;

export const PERFORMANCE_THRESHOLDS = {
    RED_ZONE: 50,
    YELLOW_ZONE: 80,
} as const;

export const UI_CONFIG = {
    DAILY_VERBS_COUNT: 6,
    IMAGE_FALLBACK: 'https://placehold.co/400x400/e2e8f0/475569?text=Imagen+no+disponible',
    ANIMATION_DURATION: 500,
} as const;

export const MESSAGES = {
    CORRECT_ANSWER: '¡Correcto!',
    INCORRECT_FORMS: 'Incorrecto. Escribe las formas correctas para continuar.',
    INCORRECT_TRANSLATION: 'Incorrecto. Escribe la traducción correcta para continuar.',
    CORRECTION_COMPLETE: '¡Muy bien! Error corregido.',
    CORRECTION_INCOMPLETE_FORMS: 'Aún no es correcto. Cópialo exactamente como se muestra.',
} as const;

export const LOCAL_STORAGE_KEYS = {
    USER_ATTEMPTS: 'userAttemptsPerVerb',
    VERB_DAY: 'verbDay',
    LAST_CHECK: 'lastDailyCheck',
    DAILY_VERBS: 'dailyVerbs',
} as const;