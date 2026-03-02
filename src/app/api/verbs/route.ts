import { NextResponse } from 'next/server';
import { VerbRepository } from '@/lib/db/repositories/verbRepository';
import { IVerbRepository } from '@/lib/db/repositories/interfaces/IVerbRepository';

const repository: IVerbRepository = new VerbRepository();

export async function GET() {
    await repository.init();
    const verbs = await repository.getAll();
    return NextResponse.json(verbs);
}

export async function POST(request: Request) {
    await repository.init();
    const data = await request.json();
    const newVerb = await repository.create(data);
    return NextResponse.json(newVerb, { status: 201 });
}

export async function PUT(request: Request) {
    const data = await request.json();
    const updatedVerb = await repository.update(data);
    return NextResponse.json(updatedVerb);
}

export async function DELETE(request: Request) {
    const { infinitive } = await request.json();
    await repository.delete(infinitive);
    return NextResponse.json({ message: 'Verb deleted' });
}