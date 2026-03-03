import { DailySession } from '@/types';

const HISTORY_KEY = 'sr_session_history';

export class SessionHistoryRepository {
    getAll(): DailySession[] {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
        } catch {
            return [];
        }
    }

    getToday(date: string): DailySession | null {
        return this.getAll().find((s) => s.date === date) ?? null;
    }

    save(session: DailySession): void {
        const all = this.getAll();
        const idx = all.findIndex((s) => s.date === session.date);
        if (idx >= 0) all[idx] = session;
        else all.push(session);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
    }

    getLast(n: number): DailySession[] {
        return this.getAll().slice(-n);
    }
}