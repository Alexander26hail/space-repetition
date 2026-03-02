import { getTursoClient } from '@/lib/db/client';
import { initSchema } from '@/lib/db/schema';
import { IVerbRepository } from '@/lib/db/repositories/interfaces/IVerbRepository';
import { Verb } from '@/types';

export class VerbRepository implements IVerbRepository {
    async init(): Promise<void> {
        await initSchema();
    }

    async getAll(): Promise<Verb[]> {
        const result = await getTursoClient().execute('SELECT * FROM verbs');
        return result.rows.map(this.mapToVerb);
    }

    async create(data: Verb): Promise<Verb> {
        await getTursoClient().execute({
            sql: `INSERT INTO verbs 
                  (infinitive, pastSimple, pastParticiple, spanish, SpanishPast, SpanishPastParticiple, explanation, imageUrl)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                data.infinitive,
                data.pastSimple,
                data.pastParticiple,
                data.spanish,
                data.SpanishPast,
                data.SpanishPastParticiple,
                data.explanation,
                data.imageUrl,
            ],
        });
        return data;
    }

    async update(data: Verb): Promise<Verb> {
        await getTursoClient().execute({
            sql: `UPDATE verbs 
                  SET pastSimple=?, pastParticiple=?, spanish=?, SpanishPast=?, SpanishPastParticiple=?, explanation=?, imageUrl=?
                  WHERE infinitive=?`,
            args: [
                data.pastSimple,
                data.pastParticiple,
                data.spanish,
                data.SpanishPast,
                data.SpanishPastParticiple,
                data.explanation,
                data.imageUrl,
                data.infinitive,
            ],
        });
        return data;
    }

    async delete(id: string): Promise<void> {
        await getTursoClient().execute({
            sql: 'DELETE FROM verbs WHERE infinitive=?',
            args: [id],
        });
    }

    private mapToVerb(row: Record<string, unknown>): Verb {
        return {
            infinitive: row.infinitive as string,
            pastSimple: row.pastSimple as string,
            pastParticiple: row.pastParticiple as string,
            spanish: row.spanish as string,
            SpanishPast: row.SpanishPast as string,
            SpanishPastParticiple: row.SpanishPastParticiple as string,
            explanation: row.explanation as string,
            imageUrl: row.imageUrl as string,
        };
    }
}