import { getTursoClient } from './client';

export async function initSchema(): Promise<void> {
    await getTursoClient().execute(`
        CREATE TABLE IF NOT EXISTS verbs (
            infinitive              TEXT PRIMARY KEY,
            pastSimple              TEXT NOT NULL,
            pastParticiple          TEXT NOT NULL,
            spanish                 TEXT NOT NULL,
            SpanishPast             TEXT NOT NULL,
            SpanishPastParticiple   TEXT NOT NULL,
            explanation             TEXT NOT NULL,
            imageUrl                TEXT NOT NULL
        )
    `);
}