import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import verbs from '../data/verbs.json';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function seed() {
    console.log('🌱 Creando tabla...');
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

    console.log('🌱 Insertando verbos...');
    for (const verb of verbs) {
        await client.execute({
            sql: `INSERT OR IGNORE INTO verbs 
                  (infinitive, pastSimple, pastParticiple, spanish, SpanishPast, SpanishPastParticiple, explanation, imageUrl)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                verb.infinitive,
                verb.pastSimple,
                verb.pastParticiple,
                verb.spanish,
                verb.SpanishPast,
                verb.SpanishPastParticiple,
                verb.explanation,
                verb.imageUrl,
            ],
        });
    }

    console.log(`✅ ${verbs.length} verbos insertados!`);
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
});