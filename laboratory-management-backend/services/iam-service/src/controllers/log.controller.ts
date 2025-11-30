import type { NextFunction, Request, Response } from "express";
import { LogService } from "../services/log.service.js";
import { AppError } from "../utils/error.util.js";
import { PaginationUtils } from "../utils/pagination.util.js";
import { AuthenticatedUser } from "../types/authenticatedUser.type.js";

const logService = new LogService();

const getLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Audit Logs']
    #swagger.description = 'Get log by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Log ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Log retrieved successfully',
      schema: {
        _id: 'string',
        action: 'string',
        eventMessage: 'string',
        userId: 'string',
        performedAt: 'string',
        serviceName: 'string',
        createdAt: 'string',
        updatedAt: 'string'
      }
    }
    #swagger.responses[400] = { description: 'Log ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'Log not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const logId = req.params.id;
    if (!logId) {
      throw new AppError(400, "Log ID is required");
    }

    const log = await logService.getLog(logId);
    if (log) {
      throw new AppError(404, "Log not found");
    }

    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

const getLogsWithPagination = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Audit Logs']
    #swagger.description = 'Get logs with pagination (For performedAt option please use MM/DD/YYYY or YYYY-MM-DD format)'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of logs per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (log ID)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['createdAt', '_id', 'action', 'eventMessage', 'performedAt', 'serviceName'],
      default: 'performedAt'
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Search term to filter logs',
      required: false,
      type: 'string'
    }
    #swagger.parameters['searchField'] = {
      in: 'query',
      description: 'Fields to search by',
      required: false,
      type: 'string',
      enum: ['action', 'eventMessage', 'performedAt', 'serviceName'],
      default: 'action'
    }
    #swagger.parameters['sortOrder'] = {
      in: 'query',
      description: 'Sort order',
      required: false,
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'desc'
    }
    #swagger.responses[200] = {
      description: 'Logs retrieved successfully',
      schema: {
        data: {
          type: 'array',
          items: {
            _id: 'string',
            action: 'string',
            eventMessage: 'string',
            userId: 'string',
            performedAt: 'string',
            serviceName: 'string',
            createdAt: 'string',
            updatedAt: 'string'
          }
        },
        pagination: {
          hasNextPage: 'boolean',
          hasPreviousPage: 'boolean',
          nextCursor: 'string',
          previousCursor: 'string',
          totalCount: 'number',
          limit: 'number'
        }
      }
    }
    #swagger.responses[400] = { description: 'Invalid pagination parameters' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const options = PaginationUtils.parseQuery(req.query);
    const logs = await logService.getLogsWithPagination(options);
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

const deleteLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Audit Logs']
    #swagger.description = 'Delete log by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Log ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Log deleted successfully',
      schema: {
        message: 'Log deleted successfully!',
        logId: 'string'
      }
    }
    #swagger.responses[400] = { description: 'Log ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'Log not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const logId = req.params.id;
    if (!logId) {
      throw new AppError(400, "Log ID is required");
    }

    const deletedLog = await logService.deleteLog(
      logId,
      (req.user as AuthenticatedUser)?._id
    );
    if (!deletedLog) {
      throw new AppError(404, "Log not found");
    }

    res.status(200).json({
      message: "Log deleted successfully!",
      logId: deletedLog._id,
    });
  } catch (error) {
    next(error);
  }
};

export { getLog, getLogsWithPagination, deleteLog };
