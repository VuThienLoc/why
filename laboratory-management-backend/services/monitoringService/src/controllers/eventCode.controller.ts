import type { Request, Response } from "express";
import eventCodeService, { type CreateEventCodePayload, type UpdateEventCodePayload, type EventCodeFilters } from "../services/eventCode.service.js";
import { normalizeServiceName, type ServiceName } from "../constants/event.constant.js";
import { errorHandler } from "../utils/error.util.js";

const getAllEventCodes = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Codes']
    #swagger.description = 'Get all event codes with filters and pagination'
    #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1 }
    #swagger.parameters['limit'] = { in: 'query', type: 'integer', default: 50 }
    #swagger.parameters['service_name'] = {
      in: 'query',
      type: 'string',
      enum: ['IAM_SERVICE', 'PATIENT_SERVICE', 'TEST_ORDER_SERVICE', 'WAREHOUSE_SERVICE', 'MONITORING_SERVICE', 'CHAT_SERVICE'],
      description: 'Filter by originating service identifier (legacy values such as IAM are auto-mapped)'
    }
    #swagger.parameters['is_active'] = { in: 'query', type: 'boolean' }
  */
  try {
    const { page = "1", limit = "50", service_name, is_active } = req.query;

    let normalizedServiceName: ServiceName | undefined;
    if (typeof service_name === "string") {
      normalizedServiceName = normalizeServiceName(service_name);
      if (!normalizedServiceName) {
        res.status(400).json({ message: "Invalid service_name value. Use one of the predefined service identifiers." });
        return;
      }
    }

    const filters: EventCodeFilters = {
      ...(normalizedServiceName ? { service_name: normalizedServiceName } : {}),
      ...(typeof is_active === "string" ? { is_active: is_active.toLowerCase() === "true" } : {}),
    };

    const result = await eventCodeService.getAllEventCodes(filters, Number(page), Number(limit));
    res.status(200).json(result);
  } catch (error) {
    errorHandler(res, error);
  }
};

const getEventCodeByCode = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Codes']
    #swagger.description = 'Get event code by code'
    #swagger.parameters['code'] = { in: 'path', type: 'string', required: true }
  */
  try {
    const { code } = req.params;

    if (typeof code !== "string" || code.trim().length === 0) {
      res.status(400).json({ message: "Missing event code parameter" });
      return;
    }

    const eventCode = await eventCodeService.getEventCodeByCode(code.toUpperCase());
    if (!eventCode) {
      res.status(404).json({ message: "Event code not found" });
      return;
    }

    res.status(200).json({ eventCode });
  } catch (error) {
    errorHandler(res, error);
  }
};

const createEventCode = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Codes']
    #swagger.description = 'Create a new event code'
    #swagger.security = [{"internalApiKey": []}, {"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        event_code: 'E_00003',
        event_name: 'TEST_ORDER_DELETED',
        description: 'Event message used when a test order is deleted.',
        service_name: 'TEST_ORDER_SERVICE'
      }
    }
  */
  try {
    const payload: CreateEventCodePayload = req.body;

    if (!payload.event_code || !payload.event_name || !payload.description || !payload.service_name) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const normalizedServiceName = normalizeServiceName(payload.service_name);
    if (!normalizedServiceName) {
      res.status(400).json({ message: "Invalid service_name value. Use one of the predefined service identifiers." });
      return;
    }

    payload.service_name = normalizedServiceName;

    const eventCode = await eventCodeService.createEventCode(payload);
    res.status(201).json({ message: "Event code created", eventCode });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateEventCode = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Codes']
    #swagger.description = 'Update event code'
    #swagger.parameters['code'] = { in: 'path', type: 'string', required: true }
    #swagger.security = [{"internalApiKey": []}, {"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      required: false,
      schema: {
        event_name: 'TEST_ORDER_DELETED',
        description: 'Event message used when a test order is deleted.',
        service_name: 'TEST_ORDER_SERVICE'
      }
    }
  */
  try {
    const { code } = req.params;
    const payload: UpdateEventCodePayload = req.body;

    if (typeof code !== "string" || code.trim().length === 0) {
      res.status(400).json({ message: "Missing event code parameter" });
      return;
    }

    if (typeof payload.service_name === "string") {
      const normalizedServiceName = normalizeServiceName(payload.service_name);
      if (!normalizedServiceName) {
        res.status(400).json({ message: "Invalid service_name value. Use one of the predefined service identifiers." });
        return;
      }
      payload.service_name = normalizedServiceName;
    }

    const eventCode = await eventCodeService.updateEventCode(code.toUpperCase(), payload);
    if (!eventCode) {
      res.status(404).json({ message: "Event code not found" });
      return;
    }

    res.status(200).json({ message: "Event code updated", eventCode });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteEventCode = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.tags = ['Event Codes']
    #swagger.description = 'Soft delete event code (set is_active to false)'
    #swagger.parameters['code'] = { in: 'path', type: 'string', required: true }
    #swagger.security = [{"internalApiKey": []}]
  */
  try {
    const { code } = req.params;

    if (typeof code !== "string" || code.trim().length === 0) {
      res.status(400).json({ message: "Missing event code parameter" });
      return;
    }

    const deleted = await eventCodeService.deleteEventCode(code.toUpperCase());
    if (!deleted) {
      res.status(404).json({ message: "Event code not found" });
      return;
    }

    res.status(200).json({ message: "Event code deactivated" });
  } catch (error) {
    errorHandler(res, error);
  }
};

export {
  getAllEventCodes,
  getEventCodeByCode,
  createEventCode,
  updateEventCode,
  deleteEventCode,
};
