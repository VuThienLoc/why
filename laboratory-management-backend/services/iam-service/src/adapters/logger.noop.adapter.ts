import { ILoggerPort } from "../ports/logger.port.js";
import { MonitoringEvent } from "../types/monitoring.type.js";

/**
 * No-op Logger Adapter
 * Used when monitoring is disabled or as a safe fallback
 * Logs to console but doesn't send to external service
 */
export class NoOpLoggerAdapter implements ILoggerPort {
  private readonly serviceName: string;

  constructor(serviceName: string = "IAM Service") {
    this.serviceName = serviceName;
  }

  async emitEvent(event: MonitoringEvent): Promise<void> {
    // Just log locally - no external call
    console.log(`[${this.serviceName}] Event logged locally:`, {
      event_code: event.event_code,
      action: event.action,
      operator_id: event.operator_id,
      message: event.event_message,
    });
  }

  isHealthy(): boolean {
    return true; // Always healthy since it's no-op
  }
}
