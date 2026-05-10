import pino from "pino";
import type { AppConfig } from "@bootstrap/Container";

export type AppLogger = ReturnType<typeof pino>;

export function createAppLogger(env: AppConfig["env"]): AppLogger {
  return pino({
    level: process.env["LOG_LEVEL"] || (env === "production" ? "info" : "debug"),
    base: {
      service: "orcta-enterprise-template",
      env,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie", "password", "token", "apiKey"],
      remove: true,
    },
    serializers: {
      err: pino.stdSerializers.err,
    },
  });
}
