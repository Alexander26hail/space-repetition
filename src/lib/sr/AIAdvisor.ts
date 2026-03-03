import Groq from 'groq-sdk';
import { VerbProgress, AIRecommendation } from './types';

// ─── Interface (Open/Closed — puedes cambiar de Groq a otro modelo) ──────────
export interface IAIAdvisor {
    getRecommendation(
        progress: VerbProgress,
        sessionErrors: string[]
    ): Promise<AIRecommendation>;
}

// ─── Implementación con Groq ─────────────────────────────────────────────────
export class GroqAIAdvisor implements IAIAdvisor {
    private client: Groq;

    constructor() {
        this.client = new Groq({ apiKey: process.env.GROQ_API_KEY! });
    }

    async getRecommendation(
        progress: VerbProgress,
        sessionErrors: string[]
    ): Promise<AIRecommendation> {
        const successRate = progress.totalCorrect + progress.totalIncorrect > 0
            ? Math.round((progress.totalCorrect / (progress.totalCorrect + progress.totalIncorrect)) * 100)
            : 0;

        const prompt = `
Eres un experto en spaced repetition. Analiza y responde en cuántos minutos revisar este verbo.

Verbo: "${progress.infinitive}"
Tasa de éxito: ${successRate}%
Correcto: ${progress.totalCorrect} | Incorrecto: ${progress.totalIncorrect}
Racha correcta: ${progress.repetitions}
Intervalo SM-2: ${progress.interval} días
Errores esta sesión: ${sessionErrors.length > 0 ? sessionErrors.join(', ') : 'ninguno'}

REGLAS:
- Recién fallado → 5-10 min
- 1-2 correctas seguidas → 30-60 min
- 3+ correctas → 2-8 horas
- >80% histórico → 1-2 días (1440-2880 min)
- <40% histórico → menos de 30 min

Responde SOLO con JSON sin markdown:
{
  "nextReviewMinutes": <número>,
  "reason": "<máximo 8 palabras en español>",
  "difficulty": "<easy|medium|hard>",
  "focusAreas": []
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'llama3-8b-8192',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 120,
            });

            const content = response.choices[0]?.message?.content ?? '{}';
            return JSON.parse(content.replace(/```json|```/g, '').trim());
        } catch {
            return this.fallback(progress);
        }
    }

    // Fallback sin IA — respeta el principio de no romper el flujo
    private fallback(progress: VerbProgress): AIRecommendation {
        const rate = progress.totalCorrect + progress.totalIncorrect > 0
            ? (progress.totalCorrect / (progress.totalCorrect + progress.totalIncorrect)) * 100
            : 0;

        if (progress.repetitions === 0) return { nextReviewMinutes: 5,    reason: 'Primera vez o recién fallado', difficulty: 'hard',   focusAreas: [] };
        if (rate < 40)                  return { nextReviewMinutes: 15,   reason: 'Tasa de éxito baja',           difficulty: 'hard',   focusAreas: [] };
        if (progress.repetitions < 3)   return { nextReviewMinutes: 60,   reason: 'Aún aprendiendo',              difficulty: 'medium', focusAreas: [] };
        if (rate >= 80)                 return { nextReviewMinutes: 1440, reason: 'Buen dominio',                 difficulty: 'easy',   focusAreas: [] };
        return                                 { nextReviewMinutes: 120,  reason: 'Progreso moderado',            difficulty: 'medium', focusAreas: [] };
    }
}