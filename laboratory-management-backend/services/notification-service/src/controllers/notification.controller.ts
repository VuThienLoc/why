import type { NextFunction, Request, Response } from "express";
import type { Server } from "socket.io";
import { NotificationService } from "../services/notification.service.js";
import { AppError } from "../../../shared/src/utils/error.util.js";
import { PaginationUtils } from "../../../shared/src/utils/pagination.util.js";

const notificationService = new NotificationService();

const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Notification Service']
    #swagger.description = 'Create a notification for user'
    #swagger.security = [{ "apiKeyAuth": [] }]
    #swagger.parameters['type'] = {
      in: 'query',
      description: 'Notification type',
      required: true,
      type: 'string',
      enum: ['NEW_MESSAGE', 'ROOM_JOIN', 'LAB_RESULT_READY', 'ROLE_CHANGED', 'GENERIC'],
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Notification payload',
      required: true,
      schema: {
        body: 'string',
        data: {}
      }
    }
    #swagger.responses[201] = {
      description: 'Notification created successfully',
      schema: {
        _id: 'string',
        userId: 'string',
        type: 'string',
        title: 'string',
        body: 'string',
        data: {},
        isRead: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing required fields',
      schema: {
        message: 'Missing notification type'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { body, data } = req.body;
    const { userId } = req.params;
    const type = req.query.type as string;

    if (!type) {
      throw new AppError(400, "Missing notification type");
    }

    const notification = await notificationService.notifyUser(
      userId,
      type,
      body,
      data
    );

    const io = req.app.get("io") as Server | undefined;
    if (io) {
      io.to(`user:${userId}`).emit("notifications:updated", notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

const createNotificationMany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Notification Service']
    #swagger.description = 'Create a notification for many users'
    #swagger.security = [{ "apiKeyAuth": [] }]
    #swagger.parameters['type'] = {
      in: 'query',
      description: 'Notification type',
      required: true,
      type: 'string',
      enum: ['NEW_MESSAGE', 'ROOM_JOIN', 'LAB_RESULT_READY', 'ROLE_CHANGED', 'GENERIC'],
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Notification payload',
      required: true,
      schema: {
        userId: {
            type: 'array',
            items: { type: 'string' }
        },
        body: 'string',
        data: {}
      }
    }
    #swagger.responses[201] = {
      description: 'Notification created successfully',
      schema: {
        _id: 'string',
        userId: 'string',
        type: 'string',
        title: 'string',
        body: 'string',
        data: {},
        isRead: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing required fields',
      schema: {
        message: 'Missing notification type'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { userId, body, data } = req.body;
    const type = req.query.type as string;

    if (!type) {
      throw new AppError(400, "Missing notification type");
    }

    const notification = await notificationService.notifyManyUsers(
      userId,
      type,
      body,
      data
    );

    const io = req.app.get("io") as Server | undefined;
    if (io) {
      notification.forEach((notif) => {
        io.to(`user:${notif.userId}`).emit("notifications:updated", notif);
      });
    }

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

const listNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Notification Service']
    #swagger.description = 'Get notifications for the current user with pagination'
    #swagger.security = [{ "apiKeyAuth": [] }]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of notifications per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (notification ID or sort field value)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['createdAt', 'updatedAt', '_id'],
      default: 'createdAt'
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Search term to filter rooms',
      required: false,
      type: 'string'
    }
    #swagger.parameters['searchField'] = {
      in: 'query',
      description: 'Fields to search by',
      required: false,
      type: 'string',
      enum: ['name', 'participants'],
      default: 'name'
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
      description: 'Notifications retrieved successfully',
      schema: {
        data: {
          type: 'array',
          items: {
            _id: 'string',
            userId: 'string',
            type: 'string',
            title: 'string',
            body: 'string',
            data: {},
            isRead: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z'
          }
        },
        pagination: {
          hasNextPage: true,
          nextCursor: 'string',
          totalCount: 42,
          limit: 10
        }
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const auth = (req as any).auth as { userId: string };
    const options = PaginationUtils.parseQuery(req.query);
    const result = await notificationService.listNotifs(options, {
      userId: auth.userId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Notification Service']
    #swagger.description = 'Mark a notification as read'
    #swagger.security = [{ "apiKeyAuth": [] }]
    #swagger.parameters['notificationId'] = {
      in: 'path',
      description: 'Notification ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Notification marked as read successfully',
      schema: {
        _id: 'string',
        userId: 'string',
        type: 'string',
        title: 'string',
        body: 'string',
        data: {},
        isRead: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing notification ID',
      schema: {
        message: 'Missing notification ID'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      throw new AppError(400, "Missing notification ID");
    }

    const updated = await notificationService.markAsRead(notificationId);

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Notification Service']
    #swagger.description = 'Delete a notification for the current user'
    #swagger.security = [{ "apiKeyAuth": [] }]
    #swagger.parameters['notificationId'] = {
      in: 'path',
      description: 'Notification ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Notification deleted successfully',
      schema: {
        message: 'Notification deleted successfully'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing notification ID',
      schema: {
        message: 'Missing notification ID'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      throw new AppError(400, "Missing notification ID");
    }

    const auth = (req as any).auth as { userId: string };
    await notificationService.deleteNotification(notificationId, auth.userId);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  createNotification,
  createNotificationMany,
  listNotifications,
  markNotificationAsRead,
  deleteNotification,
};
