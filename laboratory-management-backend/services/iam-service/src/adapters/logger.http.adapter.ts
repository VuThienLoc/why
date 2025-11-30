import { ILoggerPort } from "../ports/logger.port.js";
import { MonitoringEvent, MonitoringEventResponse } from "../types/monitoring.type.js";

/**
 * HTTP Logger Adapter with resilience patterns
 * - Retries with exponential backoff
 * - Circuit breaker to prevent cascading failures
 * - Timeout protection
 * - Never throws - failures are logged but don't block business logic
 */
export class HttpLoggerAdapter implements ILoggerPort {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly timeout: number;
  private readonly maxRetries: number;
  
  // Circuit breaker state
  private failureCount: number = 0;
  private readonly failureThreshold: number = 5;
  private circuitOpen: boolean = false;
  private circuitOpenUntil: number = 0;
  private readonly circuitResetTimeout: number = 60000; // 1 minute

  constructor(config: {
    baseUrl: string;
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
  }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? 5000; // 5 seconds default
    this.maxRetries = config.maxRetries ?? 3;
  }

  async emitEvent(event: MonitoringEvent): Promise<void> {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      console.warn("[HttpLoggerAdapter] Circuit breaker is OPEN - skipping event emission");
      return;
    }

    try {
      await this.sendWithRetry(event);
      this.onSuccess();
    } catch (error) {
      this.onFailure(error);
      // Don't throw - log and continue
      console.error("[HttpLoggerAdapter] Failed to emit event after retries:", error);
    }
  }

  isHealthy(): boolean {
    return !this.isCircuitOpen();
  }

  private async sendWithRetry(event: MonitoringEvent, attempt: number = 1): Promise<void> {
    try {
      await this.sendEvent(event);
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      const jitter = Math.random() * 1000;
      await this.sleep(backoffMs + jitter);

      console.log(`[HttpLoggerAdapter] Retry ${attempt}/${this.maxRetries} after ${backoffMs}ms`);
      return this.sendWithRetry(event, attempt + 1);
    }
  }

  private async sendEvent(event: MonitoringEvent): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["X-Internal-API-Key"] = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/event-logs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...event,
          occurred_at: event.occurred_at || new Date(),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json() as MonitoringEventResponse;
      console.log("[HttpLoggerAdapter] Event emitted successfully:", result.message);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error("Unknown error during event emission");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private isCircuitOpen(): boolean {
    if (this.circuitOpen && Date.now() >= this.circuitOpenUntil) {
      // Try to close the circuit
      console.log("[HttpLoggerAdapter] Circuit breaker attempting to close");
      this.circuitOpen = false;
      this.failureCount = 0;
    }
    return this.circuitOpen;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.circuitOpen) {
      console.log("[HttpLoggerAdapter] Circuit breaker CLOSED - service recovered");
      this.circuitOpen = false;
    }
  }

  private onFailure(error: unknown): void {
    this.failureCount++;
    console.error(`[HttpLoggerAdapter] Failure ${this.failureCount}/${this.failureThreshold}:`, error);

    if (this.failureCount >= this.failureThreshold && !this.circuitOpen) {
      this.circuitOpen = true;
      this.circuitOpenUntil = Date.now() + this.circuitResetTimeout;
      console.error(
        `[HttpLoggerAdapter] Circuit breaker OPENED - will retry after ${this.circuitResetTimeout}ms`
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
