import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    // エージェントが並行で起動するときは npm run dev -- --port 5174 のように変える
    port: 5173,
    strictPort: true,
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
