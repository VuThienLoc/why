import monitoringServiceClient, { type MonitoringEventLogPayload } from "./monitoringService.client.js";
import {
  MonitoringEventCodes,
  MonitoringEventActions,
  MonitoringServiceName,
} from "../constants/monitoring.constant.js";

interface MedicalRecordMonitoringPayload {
  medicalRecordId: string;
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

class MedicalRecordMonitoringService {
  private normalize(value: string | null | undefined): string | undefined {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    return undefined;
  }

  private getDifferences(oldData: any, newData: any) {
    const oldDiff: any = {};
    const newDiff: any = {};

    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    for (const key of allKeys) {
      // Bỏ qua các trường metadata thường xuyên thay đổi hoặc không quan trọng
      if (['updated_at', 'updated_by', '__v'].includes(key)) continue;

      const oldVal = oldData?.[key];
      const newVal = newData?.[key];

      // So sánh deep bằng JSON.stringify
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        oldDiff[key] = oldVal;
        newDiff[key] = newVal;
      }
    }
    return { oldDiff, newDiff };
  }

  async recordCreated(payload: MedicalRecordMonitoringPayload): Promise<void> {
    await this.sendEvent({
      ...payload,
      oldValues: null,
      eventCode: MonitoringEventCodes.MEDICAL_RECORD_CREATED,
      action: MonitoringEventActions.CREATE,
    });
  }

  async recordUpdated(payload: MedicalRecordMonitoringPayload): Promise<void> {
    const { oldDiff, newDiff } = this.getDifferences(payload.oldValues, payload.newValues);
    await this.sendEvent({
      ...payload,
      oldValues: oldDiff,
      newValues: newDiff,
      eventCode: MonitoringEventCodes.MEDICAL_RECORD_UPDATED,
      action: MonitoringEventActions.UPDATE,
    });
  }

  async recordDeleted(payload: MedicalRecordMonitoringPayload): Promise<void> {
    await this.sendEvent({
      ...payload,
      newValues: null,
      eventCode: MonitoringEventCodes.MEDICAL_RECORD_DELETED,
      action: MonitoringEventActions.DELETE,
    });
  }

  private async sendEvent(
    payload: MedicalRecordMonitoringPayload & { eventCode: string; action: string }
  ): Promise<void> {
    const operatorId = this.normalize(payload.operatorId) ?? "system";
    const operatorEmail = this.normalize(payload.operatorEmail);
    const operatorName = this.normalize(payload.operatorName);
    const operatorRole = this.normalize(payload.operatorRole);
    const operatorAvatar = this.normalize(payload.operatorAvatar);

    const monitoringPayload: MonitoringEventLogPayload = {
      event_code: payload.eventCode,
      action: payload.action,
      event_message: payload.eventMessage,
      service_name: MonitoringServiceName,
      entity_id: payload.medicalRecordId,
      old_values: payload.oldValues ?? null,
      new_values: payload.newValues ?? null,
      operator_id: operatorId,
      occurred_at: new Date(),
    };

    if (operatorName) {
      monitoringPayload.operator_name = operatorName;
    }

    if (operatorEmail && operatorEmail.includes("@")) {
      monitoringPayload.operator_gmail = operatorEmail;
    }

    if (operatorRole) {
      monitoringPayload.operator_role = operatorRole;
    }

    if (operatorAvatar) {
      monitoringPayload.operator_avatar = operatorAvatar;
    }

    try {
      await monitoringServiceClient.createEventLog(monitoringPayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      console.error(
        `[MonitoringService] Failed to record medical record event ${payload.eventCode}: ${message}`
      );
    }
  }
}

const medicalRecordMonitoringService = new MedicalRecordMonitoringService();
export default medicalRecordMonitoringService;
export type { MedicalRecordMonitoringPayload };
