import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev:web --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000/demo/judge",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
