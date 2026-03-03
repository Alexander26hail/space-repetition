import { getTursoClient } from './client';

export async function initSchema(): Promise<void> {
    const client = getTursoClient();

    await client.execute(`
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

    await client.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id        TEXT PRIMARY KEY,
            email     TEXT UNIQUE NOT NULL,
            name      TEXT,
            image     TEXT,
            createdAt TEXT NOT NULL
        )
    `);

    await client.execute(`
        CREATE TABLE IF NOT EXISTS verb_progress (
            userId          TEXT NOT NULL,
            infinitive      TEXT NOT NULL,
            easeFactor      REAL NOT NULL DEFAULT 2.5,
            interval        INTEGER NOT NULL DEFAULT 0,
            repetitions     INTEGER NOT NULL DEFAULT 0,
            nextReview      TEXT NOT NULL,
            lastReview      TEXT,
            totalCorrect    INTEGER NOT NULL DEFAULT 0,
            totalIncorrect  INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (userId, infinitive),
            FOREIGN KEY (userId)     REFERENCES users(id),
            FOREIGN KEY (infinitive) REFERENCES verbs(infinitive)
        )
    `);
}