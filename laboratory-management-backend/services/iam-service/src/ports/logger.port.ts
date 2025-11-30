import { MonitoringEvent } from "../types/monitoring.type.js";

/**
 * Logger Port - abstraction for centralized logging
 * Implementations can be HTTP, message broker, stdout, or no-op
 * This keeps IAM service independent from monitoring infrastructure
 */
export interface ILoggerPort {
  /**
   * Emit an event to the centralized logging system
   * Should never throw - failures are logged but don't block business logic
   */
  emitEvent(event: MonitoringEvent): Promise<void>;
  isHealthy(): boolean;
}
