import { createClient, type Client } from '@libsql/client';

let instance: Client | null = null;

export function getTursoClient(): Client {
    if (!instance) {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url || !authToken) {
            throw new Error(
                'Missing env vars: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN'
            );
        }

        instance = createClient({ url, authToken });
    }
    return instance;
}