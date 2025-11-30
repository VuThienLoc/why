import { ILoggerPort } from "../ports/logger.port.js";
import { HttpLoggerAdapter } from "../adapters/logger.http.adapter.js";
import { NoOpLoggerAdapter } from "../adapters/logger.noop.adapter.js";

/**
 * Logger Factory - creates the appropriate logger adapter based on environment config
 * This keeps the service code independent of the specific logging implementation
 */
export class LoggerFactory {
  static createLogger(): ILoggerPort {
    const loggerType = process.env.LOGGER_TYPE || "http"; // Default to noop for safety

    switch (loggerType.toLowerCase()) {
      case "http":
        return LoggerFactory.createHttpLogger();

      case "noop":
      default:
        console.log(
          "[LoggerFactory] Using NoOp logger - events logged locally only"
        );
        return new NoOpLoggerAdapter("IAM Service");
    }
  }

  private static createHttpLogger(): ILoggerPort {
    const baseUrl =
      process.env.MONITORING_SERVICE_URL || "http://localhost:5004/api";

    if (!baseUrl) {
      console.warn(
        "[LoggerFactory] MONITORING_SERVICE_URL not configured - falling back to NoOp logger"
      );
      return new NoOpLoggerAdapter("IAM Service");
    }

    console.log(`[LoggerFactory] Using HTTP logger - sending to ${baseUrl}`);

    const config: {
      baseUrl: string;
      apiKey?: string;
      timeout?: number;
      maxRetries?: number;
    } = { baseUrl };

    config.apiKey = process.env.MONITORING_API_KEY || "internal-service-secret-key-2025";
    if (process.env.MONITORING_TIMEOUT) {
      config.timeout = parseInt(process.env.MONITORING_TIMEOUT, 10);
    }
    if (process.env.MONITORING_MAX_RETRIES) {
      config.maxRetries = parseInt(process.env.MONITORING_MAX_RETRIES, 10);
    }

    return new HttpLoggerAdapter(config);
  }
}

// Singleton instance
let loggerInstance: ILoggerPort | null = null;

export function getLogger(): ILoggerPort {
  if (!loggerInstance) {
    loggerInstance = LoggerFactory.createLogger();
  }
  return loggerInstance;
}

// For testing - allows resetting the singleton
export function resetLogger(): void {
  loggerInstance = null;
}
