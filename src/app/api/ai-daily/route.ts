import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { verbsProgress, sessionHistory, allVerbs } = body;

        // ← Validar que llegaron los datos
        if (!allVerbs || !Array.isArray(allVerbs)) {
            return NextResponse.json({ error: 'allVerbs es requerido' }, { status: 400 });
        }

        const prompt = `
Eres un tutor de inglés experto en repetición espaciada SM-2.
Selecciona exactamente entre 4 y 6 verbos para practicar HOY.

## Progreso actual por verbo:
${JSON.stringify(verbsProgress, null, 2)}

## Historial de sesiones recientes (últimos 7 días):
${JSON.stringify(sessionHistory, null, 2)}

## Verbos disponibles:
${allVerbs.join(', ')}

## Reglas:
1. Prioriza verbos con nextReview <= hoy (vencidos).
2. Prioriza verbos con alto ratio de errores (totalIncorrect / totalCorrect).
3. Si hay pocos vencidos, agrega verbos nuevos (repetitions === 0).
4. Máximo 6 verbos, mínimo 4.
5. timesToPractice: mínimo 2, máximo 5 según dificultad.
6. IMPORTANTE: usa SOLO verbos de la lista de verbos disponibles.

Responde SOLO con este JSON sin texto extra:
{
  "verbs": [
    { "infinitive": "break", "timesToPractice": 3, "reason": "alto error rate" }
  ],
  "summary": "Frase breve en español explicando la selección de hoy"
}`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0].message.content ?? '{}';
        console.log('Respuesta IA:', content); // ← para debug
        const data = JSON.parse(content);

        // Validar que la IA devolvió verbos válidos
        if (!data.verbs || !Array.isArray(data.verbs) || data.verbs.length === 0) {
            return NextResponse.json({ error: 'La IA no devolvió verbos válidos' }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (err: unknown) {
        // ← Log detallado del error
        const message = err instanceof Error ? err.message : String(err);
        console.error('AI daily error detallado:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}