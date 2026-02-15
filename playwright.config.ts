import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Lê o arquivo .env da raiz do projeto.
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'bun run index.ts',
    port: 4000,
    reuseExistingServer: !process.env.CI,
    timeout: 15 * 1000, // Aumentei um pouco para dar tempo do banco responder
    env: {
        NODE_ENV: 'test',
        // Agora o process.env.DATABASE_URL terá o valor do seu arquivo .env
        DATABASE_URL: process.env.DATABASE_URL || '', 
    },
  }
});