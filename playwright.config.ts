import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // E2E 전용: --watch 없이 실행해 병렬 테스트의 db.json 쓰기로 인한 서버 재시작을 방지
  webServer: [
    {
      command: 'npx vite',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
    {
      command: 'npx json-server db.json --port 3001',
      url: 'http://localhost:3001/notes',
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
  ],
});
