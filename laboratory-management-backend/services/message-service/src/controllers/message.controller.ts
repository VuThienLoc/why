import type { NextFunction, Request, Response } from "express";
import { MessageService } from "../services/message.service.js";
import { AppError } from "../../../shared/src/utils/error.util.js";
import { PaginationUtils } from "../../../shared/src/utils/pagination.util.js";

const messageService = new MessageService();

const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Message Service']
    #swagger.description = 'Send a message with the current user ID in a room'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['roomId'] = {
      in: 'path',
      description: 'Room ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Message payload',
      required: true,
      schema: {
        text: 'string'
      }
    }
    #swagger.responses[200] = {
      description: 'Message created successfully',
      schema: {
        message: 'Message created successfully!',
        id: 'string',
        content: 'string',
        sender: 'string',
        createdAt: 'string'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing required fields',
      schema: {
        message: 'Missing required fields!'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { roomId } = req.params;
    const { text } = req.body;

    const auth = (req as any).auth as { userId: string };
    await messageService.createMessage(roomId, auth.userId, text);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Message Service']
    #swagger.description = 'Soft delete a message with the current user ID in a room'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['roomId'] = {
      in: 'path',
      description: 'Room ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['messageId'] = {
      in: 'path',
      description: 'Message ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Message deleted successfully',
      schema: {
        message: 'Message deleted successfully!',
        id: 'string',
        content: 'string',
        sender: 'string',
        createdAt: 'string'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing required fields',
      schema: {
        message: 'Missing required fields!'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { roomId, messageId } = req.params;

    const auth = (req as any).auth as { userId: string };
    await messageService.deleteMessage(roomId, messageId, auth.userId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const updateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Message Service']
    #swagger.description = 'Update a message with the current user ID in a room'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['roomId'] = {
      in: 'path',
      description: 'Room ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['messageId'] = {
      in: 'path',
      description: 'Message ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Message payload',
      required: true,
      schema: {
        text: 'string'
      }
    }
    #swagger.responses[200] = {
      description: 'Message updated successfully',
      schema: {
        message: 'Message updated successfully!',
        id: 'string',
        content: 'string',
        sender: 'string',
        createdAt: 'string'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request - missing required fields',
      schema: {
        message: 'Missing required fields!'
      }
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { roomId, messageId } = req.params;
    const { text } = req.body;

    console.log(roomId, messageId, text);

    const auth = (req as any).auth as { userId: string };
    const updatedMessage = await messageService.updateMessage(
      roomId,
      messageId,
      auth.userId,
      text
    );

    res.status(200).json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

const getRoomMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Message Service']
    #swagger.description = 'Get messages with pagination'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['roomId'] = {
      in: 'path',
      description: 'Room ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of messages per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (message ID)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['updatedAt', '_id', 'createdAt'],
      default: 'createdAt'
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Search term to filter messages',
      required: false,
      type: 'string'
    }
    #swagger.parameters['searchField'] = {
      in: 'query',
      description: 'Fields to search by',
      required: false,
      type: 'string',
      enum: ['text', 'createdAt'],
      default: 'text'
    }
    #swagger.parameters['sortOrder'] = {
      in: 'query',
      description: 'Sort order',
      required: false,
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'asc'
    }
    #swagger.responses[200] = {
      description: 'Messages retrieved successfully',
      schema: {
        data: {
          type: 'array',
          items: {
            _id: 'string',
            text: 'string',
            userId: 'string',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z'
          }
        },
        pagination: {
          hasNextPage: true,
          hasPreviousPage: false,
          nextCursor: 'string',
          previousCursor: 'string',
          totalCount: 100,
          limit: 10
        }
      }
    }
    #swagger.responses[400] = { description: 'Invalid pagination parameters' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { roomId } = req.params;

    if (!roomId) {
      throw new AppError(400, "Missing room ID");
    }

    const options = PaginationUtils.parseQuery(req.query);
    const result = await messageService.getMessagesByRoomId(roomId, options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export { sendMessage, getRoomMessages, updateMessage, deleteMessage };
