import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SRTursoRepository } from '@/lib/sr/SRTursoRepository';
import { SRService } from '@/lib/sr/SRService';
import { SM2Algorithm } from '@/lib/sr/SM2Algorithm';
import { initSchema } from '@/lib/db/schema';

// GET /api/sr?infinitives=go,make,take
export async function GET(req: Request) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initSchema();
    const { searchParams } = new URL(req.url);
    const infinitives = searchParams.get('infinitives')?.split(',') ?? [];

    const repo = new SRTursoRepository(session.user.id);
    const service = new SRService(repo, new SM2Algorithm());

    const due = service.getDueVerbs(infinitives, 6);
    const stats = service.getGlobalStats();

    return NextResponse.json({ due, stats });
}

// POST /api/sr  { infinitive, isCorrect }
export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initSchema();
    const { infinitive, isCorrect } = await req.json();

    const repo = new SRTursoRepository(session.user.id);
    const service = new SRService(repo, new SM2Algorithm());
    const updated = service.update(infinitive, isCorrect);

    return NextResponse.json(updated);
}