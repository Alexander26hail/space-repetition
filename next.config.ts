import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['i.imgur.com'],
    },
    env: {
        TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    },
};

export default nextConfig;