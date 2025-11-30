import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["services/**/src/test/**/*.test.ts"],
    onConsoleLog(log, type) {
      if (
        log.includes("[NotifServiceClient]") ||
        log.includes("OAuth status check error:") ||
        log.includes("Error calling notification service createNotification") ||
        log.includes("Error:")
      ) {
        return false;
      }
      return undefined;
    },
  },
});
