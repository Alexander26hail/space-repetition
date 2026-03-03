import { NextResponse } from 'next/server';
import { GroqAIAdvisor } from '@/lib/sr/AIAdvisor';
import { VerbProgress } from '@/lib/sr/types';

// Singleton — no crear cliente en cada request
const advisor = new GroqAIAdvisor();

export async function POST(request: Request) {
    try {
        const { progress, sessionErrors }: {
            progress: VerbProgress;
            sessionErrors: string[];
        } = await request.json();

        if (progress.totalCorrect + progress.totalIncorrect < 2) {
            return NextResponse.json({
                nextReviewMinutes: 5,
                reason: 'Primera interacción',
                difficulty: 'medium',
                focusAreas: [],
            });
        }

        const recommendation = await advisor.getRecommendation(progress, sessionErrors);
        return NextResponse.json(recommendation);

    } catch (error) {
        console.error('AI Advisor error:', error);
        
        return NextResponse.json({
            nextReviewMinutes: 60,
            reason: 'Revisión estándar',
            difficulty: 'medium',
            focusAreas: [],
        });
    }
}