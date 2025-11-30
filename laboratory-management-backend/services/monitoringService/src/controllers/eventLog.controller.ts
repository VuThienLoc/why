import type { Request, Response } from "express";
import eventLogService, { type CreateEventLogPayload, type EventLogFilters } from "../services/eventLog.service.js";
import { normalizeServiceName, type ServiceName } from "../constants/event.constant.js";
import { errorHandler } from "../utils/error.util.js";

const createEventLog = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Logs']
    #swagger.description = 'Create a new event log'
    #swagger.security = [{"internalApiKey": []}]
  */
  try {
    const payload: CreateEventLogPayload = req.body;

    if (!payload.event_code || !payload.action || !payload.event_message || !payload.service_name || !payload.operator_id) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const normalizedServiceName = normalizeServiceName(payload.service_name);
    if (!normalizedServiceName) {
      res.status(400).json({ message: "Invalid service_name value. Use a predefined service identifier." });
      return;
    }

    payload.service_name = normalizedServiceName;

    const eventLog = await eventLogService.createEventLog(payload);
    res.status(201).json({ message: "Event log created", eventLog });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAllEventLogs = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Logs']
    #swagger.description = 'Get all event logs with filters and pagination'
    #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1 }
    #swagger.parameters['limit'] = { in: 'query', type: 'integer', default: 50 }
    #swagger.parameters['event_code'] = { in: 'query', type: 'string' }
    #swagger.parameters['service_name'] = {
      in: 'query',
      type: 'string',
      enum: ['IAM_SERVICE', 'PATIENT_SERVICE', 'TEST_ORDER_SERVICE', 'WAREHOUSE_SERVICE', 'MONITORING_SERVICE', 'CHAT_SERVICE'],
      description: 'Filter by originating service identifier (legacy values are auto-mapped).'
    }
    #swagger.parameters['operator_id'] = { in: 'query', type: 'string' }
    #swagger.parameters['action'] = { in: 'query', type: 'string' }
  */
  try {
    const { page = "1", limit = "50", event_code, service_name, operator_id, entity_id, action, start_date, end_date } = req.query;

    let normalizedServiceName: ServiceName | undefined;
    if (typeof service_name === "string") {
      normalizedServiceName = normalizeServiceName(service_name);
      if (!normalizedServiceName) {
        res.status(400).json({ message: "Invalid service_name value. Use a predefined service identifier." });
        return;
      }
    }

    const filters: EventLogFilters = {
      ...(typeof event_code === "string" ? { event_code } : {}),
      ...(normalizedServiceName ? { service_name: normalizedServiceName } : {}),
      ...(typeof operator_id === "string" ? { operator_id } : {}),
      ...(typeof entity_id === "string" ? { entity_id } : {}),
      ...(typeof action === "string" ? { action } : {}),
      ...(typeof start_date === "string" ? { start_date: new Date(start_date) } : {}),
      ...(typeof end_date === "string" ? { end_date: new Date(end_date) } : {}),
    };

    const result = await eventLogService.getAllEventLogs(filters, Number(page), Number(limit));
    res.status(200).json(result);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getEventLogById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Logs']
    #swagger.description = 'Get event log by ID'
    #swagger.parameters['id'] = { in: 'path', type: 'string', required: true }
  */
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim().length === 0) {
      res.status(400).json({ message: "Missing event log identifier" });
      return;
    }

    const eventLog = await eventLogService.getEventLogById(id);
    if (!eventLog) {
      res.status(404).json({ message: "Event log not found" });
      return;
    }

    res.status(200).json({ eventLog });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getEventLogsByEntity = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Logs']
    #swagger.description = 'Get event logs by entity ID'
    #swagger.parameters['entityId'] = { in: 'path', type: 'string', required: true }
  */
  try {
    const { entityId } = req.params;

    if (typeof entityId !== "string" || entityId.trim().length === 0) {
      res.status(400).json({ message: "Missing entity identifier" });
      return;
    }

    const eventLogs = await eventLogService.getEventLogsByEntity(entityId);
    res.status(200).json({ eventLogs, total: eventLogs.length });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getEventStatistics = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Logs']
    #swagger.description = 'Get event statistics for dashboard'
    #swagger.parameters['start_date'] = { in: 'query', type: 'string' }
    #swagger.parameters['end_date'] = { in: 'query', type: 'string' }
  */
  try {
    const { start_date, end_date } = req.query;

    const startDate = typeof start_date === "string" ? new Date(start_date) : undefined;
    const endDate = typeof end_date === "string" ? new Date(end_date) : undefined;

    const statistics = await eventLogService.getEventStatistics(startDate, endDate);
    res.status(200).json(statistics);
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteEventLog = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Logs']
    #swagger.description = 'Delete event log (admin only)'
    #swagger.parameters['id'] = { in: 'path', type: 'string', required: true }
    #swagger.security = [{"internalApiKey": []}]
  */
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim().length === 0) {
      res.status(400).json({ message: "Missing event log identifier" });
      return;
    }

    const deleted = await eventLogService.deleteEventLog(id);
    if (!deleted) {
      res.status(404).json({ message: "Event log not found" });
      return;
    }

    res.status(200).json({ message: "Event log deleted" });
  } catch (error) {
    errorHandler(res, error);
  }
};

export {
  createEventLog,
  getAllEventLogs,
  getEventLogById,
  getEventLogsByEntity,
  getEventStatistics,
  deleteEventLog,
};
