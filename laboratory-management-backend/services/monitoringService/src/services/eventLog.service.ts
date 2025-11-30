import EventLog, { type IEventLog } from "../db/models/EventLog.model.js";
import { v4 as uuidv4 } from "uuid";
import { normalizeServiceName, resolveServiceNameVariants, type ServiceName } from "../constants/event.constant.js";

export interface CreateEventLogPayload {
  event_code: string;
  action: string;
  event_message: string;
  service_name: ServiceName;
  entity_id?: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  operator_id: string;
  operator_name?: string;
  operator_gmail?: string;
  operator_role?: string;
  occurred_at?: Date;
  error_message?: string;
}

export interface EventLogFilters {
  event_code?: string;
  service_name?: ServiceName;
  operator_id?: string;
  entity_id?: string;
  action?: string;
  start_date?: Date;
  end_date?: Date;
}

class EventLogService {
  /**
   * Create a new event log
   */
  async createEventLog(payload: CreateEventLogPayload): Promise<IEventLog> {
    const normalizedServiceName = normalizeServiceName(payload.service_name);
    if (!normalizedServiceName) {
      throw new Error("Invalid service_name provided for event log creation");
    }

    const eventLog = new EventLog({
      event_id: uuidv4(),
      ...payload,
      service_name: normalizedServiceName,
      received_at: new Date(),
      occurred_at: payload.occurred_at || new Date(),
    });
    return eventLog.save();
  }

  /**
   * Get all event logs with filters and pagination
   */
  async getAllEventLogs(
    filters: EventLogFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: IEventLog[]; total: number; page: number; totalPages: number }> {
    const query: Record<string, unknown> = {};

    if (filters.event_code) {
      query.event_code = filters.event_code;
    }
    if (filters.service_name) {
      query.service_name = { $in: resolveServiceNameVariants(filters.service_name) };
    }
    if (filters.operator_id) {
      query.operator_id = filters.operator_id;
    }
    if (filters.entity_id) {
      query.entity_id = filters.entity_id;
    }
    if (filters.action) {
      query.action = filters.action;
    }

    // Date range filter
    if (filters.start_date || filters.end_date) {
      query.occurred_at = {};
      if (filters.start_date) {
        (query.occurred_at as Record<string, unknown>).$gte = filters.start_date;
      }
      if (filters.end_date) {
        (query.occurred_at as Record<string, unknown>).$lte = filters.end_date;
      }
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      EventLog.find(query).sort({ occurred_at: -1 }).skip(skip).limit(limit).lean<IEventLog[]>(),
      EventLog.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get event log by ID
   */
  async getEventLogById(eventId: string): Promise<IEventLog | null> {
    return EventLog.findOne({ event_id: eventId }).lean<IEventLog | null>();
  }

  /**
   * Get event logs by entity ID
   */
  async getEventLogsByEntity(entityId: string): Promise<IEventLog[]> {
    return EventLog.find({ entity_id: entityId }).sort({ occurred_at: -1 }).lean<IEventLog[]>();
  }

  /**
   * Get event logs by operator ID
   */
  async getEventLogsByOperator(operatorId: string, limit: number = 100): Promise<IEventLog[]> {
    return EventLog.find({ operator_id: operatorId })
      .sort({ occurred_at: -1 })
      .limit(limit)
      .lean<IEventLog[]>();
  }

  /**
   * Get event logs by service name
   */
  async getEventLogsByService(serviceName: ServiceName, limit: number = 100): Promise<IEventLog[]> {
    return EventLog.find({ service_name: { $in: resolveServiceNameVariants(serviceName) } })
      .sort({ occurred_at: -1 })
      .limit(limit)
      .lean<IEventLog[]>();
  }

  /**
   * Delete event log (hard delete only - for admin use)
   */
  async deleteEventLog(eventId: string): Promise<boolean> {
    const result = await EventLog.findOneAndDelete({ event_id: eventId });
    return result !== null;
  }

  /**
   * Get statistics for dashboard
   */
  async getEventStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    eventsByService: Record<string, number>;
    eventsByAction: Record<string, number>;
    recentErrors: IEventLog[];
  }> {
    const dateFilter: Record<string, unknown> = {};
    if (startDate || endDate) {
      dateFilter.occurred_at = {};
      if (startDate) {
        (dateFilter.occurred_at as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (dateFilter.occurred_at as Record<string, unknown>).$lte = endDate;
      }
    }

    const [total, byService, byAction, errors] = await Promise.all([
      EventLog.countDocuments(dateFilter),
      EventLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$service_name", count: { $sum: 1 } } },
      ]),
      EventLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$action", count: { $sum: 1 } } },
      ]),
      EventLog.find({ error_message: { $exists: true, $ne: null } })
        .sort({ occurred_at: -1 })
        .limit(10)
        .lean<IEventLog[]>(),
    ]);

    const eventsByService: Record<string, number> = {};
    byService.forEach((item: { _id: string; count: number }) => {
      const normalized = normalizeServiceName(item._id) ?? item._id;
      eventsByService[normalized] = (eventsByService[normalized] ?? 0) + item.count;
    });

    const eventsByAction: Record<string, number> = {};
    byAction.forEach((item: { _id: string; count: number }) => {
      eventsByAction[item._id] = item.count;
    });

    return {
      totalEvents: total,
      eventsByService,
      eventsByAction,
      recentErrors: errors,
    };
  }
}

export default new EventLogService();
