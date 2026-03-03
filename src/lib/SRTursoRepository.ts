import { getTursoClient } from '@/lib/db/client';
import { ISRRepository, VerbProgress } from '@/lib/sr/types'; 


export class SRTursoRepository implements ISRRepository {
    constructor(private readonly userId: string) {}

    getAll(): Record<string, VerbProgress> {
        throw new Error('Use async getAllAsync instead');
    }

    get(infinitive: string): VerbProgress {
        throw new Error('Use async getAsync instead');
    }

    save(progress: VerbProgress): void {
        throw new Error('Use async saveAsync instead');
    }

    async getAllAsync(): Promise<Record<string, VerbProgress>> {
        const result = await getTursoClient().execute({
            sql: 'SELECT * FROM verb_progress WHERE userId = ?',
            args: [this.userId],
        });
        const map: Record<string, VerbProgress> = {};
        result.rows.forEach((row) => {
            map[row.infinitive as string] = this.mapRow(row);
        });
        return map;
    }

    async getAsync(infinitive: string): Promise<VerbProgress> {
        const result = await getTursoClient().execute({
            sql: 'SELECT * FROM verb_progress WHERE userId = ? AND infinitive = ?',
            args: [this.userId, infinitive],
        });
        if (result.rows.length === 0) return this.createDefault(infinitive);
        return this.mapRow(result.rows[0]);
    }

    async saveAsync(progress: VerbProgress): Promise<void> {
        await getTursoClient().execute({
            sql: `INSERT INTO verb_progress
                    (userId, infinitive, easeFactor, interval, repetitions, nextReview, lastReview, totalCorrect, totalIncorrect)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(userId, infinitive) DO UPDATE SET
                    easeFactor     = excluded.easeFactor,
                    interval       = excluded.interval,
                    repetitions    = excluded.repetitions,
                    nextReview     = excluded.nextReview,
                    lastReview     = excluded.lastReview,
                    totalCorrect   = excluded.totalCorrect,
                    totalIncorrect = excluded.totalIncorrect`,
            args: [
                this.userId,
                progress.infinitive,
                progress.easeFactor,
                progress.interval,
                progress.repetitions,
                progress.nextReview,
                progress.lastReview ?? '',
                progress.totalCorrect,
                progress.totalIncorrect,
            ],
        });
    }

    private createDefault(infinitive: string): VerbProgress {
        return {
            infinitive,
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReview: new Date().toISOString().split('T')[0],
            lastReview: '',
            totalCorrect: 0,
            totalIncorrect: 0,
        };
    }

    private mapRow(row: Record<string, unknown>): VerbProgress {
        return {
            infinitive:     row.infinitive     as string,
            easeFactor:     row.easeFactor     as number,
            interval:       row.interval       as number,
            repetitions:    row.repetitions    as number,
            nextReview:     row.nextReview     as string,
            lastReview:     (row.lastReview    as string) ?? '',
            totalCorrect:   row.totalCorrect   as number,
            totalIncorrect: row.totalIncorrect as number,
        };
    }
}