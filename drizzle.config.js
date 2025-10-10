import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: 'timestamp'
  }
});