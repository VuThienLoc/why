import monitoringServiceClient, { type MonitoringEventLogPayload } from "./monitoringService.client.js";
import {
  MonitoringEventCodes,
  MonitoringEventActions,
  MonitoringServiceName,
} from "../constants/monitoring.constant.js";

interface BaseMonitoringPayload {
  patientId: string;
  eventMessage: string;
  operatorId?: string | null;
  operatorEmail?: string | null;
  operatorName?: string | null;
  operatorRole?: string | null;
  operatorAvatar?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

class PatientMonitoringService {
  private normalizeValue(value: string | null | undefined): string | undefined {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    return undefined;
  }

  async recordPatientCreated(payload: BaseMonitoringPayload): Promise<void> {
    await this.sendEvent({
      ...payload,
      eventCode: MonitoringEventCodes.PATIENT_CREATED,
      action: MonitoringEventActions.CREATE,
    });
  }

  async recordPatientUpdated(payload: BaseMonitoringPayload): Promise<void> {
    await this.sendEvent({
      ...payload,
      eventCode: MonitoringEventCodes.PATIENT_UPDATED,
      action: MonitoringEventActions.UPDATE,
    });
  }

  async recordPatientDeleted(payload: BaseMonitoringPayload): Promise<void> {
    await this.sendEvent({
      ...payload,
      eventCode: MonitoringEventCodes.PATIENT_DELETED,
      action: MonitoringEventActions.DELETE,
    });
  }

  private async sendEvent(
    payload: BaseMonitoringPayload & { eventCode: string; action: string }
  ): Promise<void> {
    const monitoringPayload: MonitoringEventLogPayload = {
      event_code: payload.eventCode,
      action: payload.action,
      event_message: payload.eventMessage,
      service_name: MonitoringServiceName,
      entity_id: payload.patientId,
      old_values: payload.oldValues ?? null,
      new_values: payload.newValues ?? null,
      operator_id: this.resolveOperator(payload.operatorId),
      occurred_at: new Date(),
    };

    const operatorName = this.normalizeValue(payload.operatorName);
    const operatorEmail = this.normalizeValue(payload.operatorEmail);
    const operatorAvatar = this.normalizeValue(payload.operatorAvatar);

    if (operatorName) {
      monitoringPayload.operator_name = operatorName;
    }

    if (operatorEmail) {
      monitoringPayload.operator_gmail = operatorEmail.includes("@") ? operatorEmail : undefined;
    }

    if (operatorAvatar) {
      monitoringPayload.operator_avatar = operatorAvatar;
    }

    if (typeof payload.operatorRole === "string" && payload.operatorRole.trim().length > 0) {
      monitoringPayload.operator_role = payload.operatorRole.trim();
    }

    try {
      await monitoringServiceClient.createEventLog(monitoringPayload);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error(
        `[MonitoringService] Failed to record patient event ${payload.eventCode}: ${errorMessage}`
      );
    }
  }

  private resolveOperator(operatorId?: string | null): string {
    if (typeof operatorId === "string" && operatorId.trim().length > 0) {
      return operatorId.trim();
    }
    return "system";
  }
}

export default new PatientMonitoringService();
