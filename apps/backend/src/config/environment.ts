import type { AppConfig } from "@bootstrap/Container";

export function loadConfig(): AppConfig {
  const env = process.env.NODE_ENV || "development";
  const dbUrl = process.env["DATABASE_URL"];
  const apiKeys = (process.env["API_KEYS"] || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  const deploymentId = process.env["DEPLOYMENT_ID"] || `${env}-local`;
  const serviceVersion = process.env["SERVICE_VERSION"] || "dev";
  const featureFlags = (process.env["FEATURE_FLAGS"] || "")
    .split(",")
    .map((flag) => flag.trim())
    .filter(Boolean);
  const successSampleRate = Number(
    process.env["LOG_SUCCESS_SAMPLE_RATE"] || (env === "production" ? "0.05" : "1"),
  );
  const slowRequestThresholdMs = Number(process.env["SLOW_REQUEST_THRESHOLD_MS"] || "1200");

  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  return {
    env: env as AppConfig["env"],
    database: {
      connectionString: dbUrl,
    },
    auth: {
      apiKeys,
    },
    observability: {
      env: env as AppConfig["env"],
      deploymentId,
      serviceVersion,
      featureFlags,
      successSampleRate: Number.isFinite(successSampleRate) ? successSampleRate : 0.05,
      slowRequestThresholdMs: Number.isFinite(slowRequestThresholdMs)
        ? slowRequestThresholdMs
        : 1200,
    },
  };
}
