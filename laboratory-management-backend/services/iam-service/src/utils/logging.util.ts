import { getLogger } from "../config/logger.config.js";
import { auditLogRepository } from "../repositories/index.js";
import { MonitoringEvent } from "../types/monitoring.type.js";
import { userRepository } from "../repositories/index.js";

export async function logEvent({
  eventCode,
  action,
  eventMessage,
  performedBy,
  serviceName,
  entityId,
  oldValues,
  newValues,
}: {
  eventCode: string;
  action: string;
  eventMessage: string;
  performedBy: string;
  serviceName: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}) {
  const performer = await userRepository.getUserBasicInfo(performedBy);
  // Local audit log
  await auditLogRepository.create({
    eventCode,
    action,
    eventMessage,
    userId: performedBy,
    performedAt: new Date(),
    serviceName,
  });

  // Centralized monitoring
  const logger = getLogger();
  const monitoringEvent: MonitoringEvent = {
    event_code: eventCode,
    action,
    event_message: eventMessage,
    service_name: "IAM_SERVICE",
    operator_id: performedBy,
    operator_gmail: performer?.email as string,
    operator_name: performer?.fullName as string,
    operator_avatar: performer?.avatar as string,
    occurred_at: new Date(),
    ...(entityId && { entity_id: entityId }),
    ...(oldValues && { old_values: oldValues }),
    ...(newValues && { new_values: newValues }),
  };

  logger.emitEvent(monitoringEvent).catch(console.error);
}