import type { Request, Response, NextFunction } from "express";
import iamServiceClient from "../../../shared/src/iam-service/adapter/iam.adapter.js";
import { RoomService } from "../services/room.service.js";
import { AppError } from "../../../shared/src/utils/error.util.js";
import { PaginationUtils } from "../../../shared/src/utils/pagination.util.js";

const roomService = new RoomService();

const joinChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Room Service']
    #swagger.description = 'Join a chat room'
    #swagger.parameters['roomId'] = {
      in: 'path',
      description: 'Room ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[201] = {
      description: 'User joined room',
      schema: {
        message: 'User joined',
        user: {
          _id: 'string',
          email: 'user@example.com',
          fullName: 'John Doe'
        }
      }
    }
    #swagger.responses[400] = { description: 'Missing required fields' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { roomId } = req.params;
    if (!roomId) {
      throw new AppError(400, "Room ID is required");
    }

    const user = await iamServiceClient.getUserById((req as any).auth.userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    await roomService.joinRoom(roomId, user._id, user.fullName);
    res.status(201).json({ message: "User joined", user });
  } catch (error) {
    next(error);
  }
};

const leaveChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Room Service']
    #swagger.description = 'Leave a chat room'
    #swagger.parameters['roomId'] = {
      in: 'path',
      description: 'Room ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[201] = {
      description: 'User left room',
      schema: {
        message: 'User left',
        user: {
          _id: 'string',
          email: 'user@example.com',
          fullName: 'John Doe'
        }
      }
    }
    #swagger.responses[400] = { description: 'Missing required fields' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { roomId } = req.params;
    if (!roomId) {
      throw new AppError(400, "Room ID is required");
    }

    const user = await iamServiceClient.getUserById((req as any).auth.userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    await roomService.leaveRoom(roomId, user._id);
    res.status(201).json({ message: "User left", user });
  } catch (error) {
    next(error);
  }
};

const getRooms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Room Service']
    #swagger.description = 'Get rooms with pagination'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of rooms per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (room ID)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['updatedAt', '_id', 'name', 'participants'],
      default: 'updatedAt'
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
      description: 'Users retrieved successfully',
      schema: {
        data: {
          type: 'array',
          items: {
            _id: 'string',
            name: 'string',
            participants: ['string'],
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
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const options = PaginationUtils.parseQuery(req.query);
    const rooms = await roomService.listRooms(options);
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

const getRoomsByCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Room Service']
    #swagger.description = 'Get rooms created by user with pagination'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of rooms per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (room ID)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['updatedAt', '_id', 'name', 'participants'],
      default: 'updatedAt'
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
      description: 'Users retrieved successfully',
      schema: {
        data: {
          type: 'array',
          items: {
            _id: 'string',
            name: 'string',
            participants: ['string'],
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
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const options = PaginationUtils.parseQuery(req.query);
    const auth = (req as any).auth as { userId: string };
    const rooms = await roomService.listRooms(options, {
      createdBy: auth.userId,
    });
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

const getRoomsByParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Room Service']
    #swagger.description = 'Get rooms where user is participant with pagination'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of rooms per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (room ID)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['updatedAt', '_id', 'name', 'participants'],
      default: 'updatedAt'
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
      description: 'Users retrieved successfully',
      schema: {
        data: {
          type: 'array',
          items: {
            _id: 'string',
            name: 'string',
            participants: ['string'],
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
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const options = PaginationUtils.parseQuery(req.query);
    const auth = (req as any).auth as { userId: string };
    const rooms = await roomService.listRooms(options, {
      participants: { $in: [auth.userId] },
    });
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Room Service']
    #swagger.description = 'Create a new room'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        name: 'string',
        participants: ['string']
      }
    }
    #swagger.responses[201] = {
      description: 'Room created successfully',
      schema: {
        message: 'Room created',
        data: {
          _id: 'string',
          name: 'string',
          participants: ['string']
        }
      }
    }
    #swagger.responses[400] = { description: 'Participants are required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { name, participants } = req.body;
    if (!Array.isArray(participants) || participants.length === 0) {
      throw new AppError(400, "Participants are required");
    }

    for (const participant of participants) {
      const user = await iamServiceClient.getUserById(participant);
      if (!user) {
        throw new AppError(404, `User with ID ${participant} not found`);
      }
    }

    const user = await iamServiceClient.getUserById((req as any).auth.userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    const roomName: string = name || (user as any).fullName;
    const room = await roomService.createRoom(roomName, participants, user._id);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Room Service']
    #swagger.description = 'Create a new room'
    #swagger.parameters['roomId'] = {
      in: 'path',
      description: 'Room ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        name: 'string',
        participants: ['string']
      }
    }
    #swagger.responses[201] = {
      description: 'Room created successfully',
      schema: {
        message: 'Room created',
        data: {
          _id: 'string',
          name: 'string',
          participants: ['string']
        }
      }
    }
    #swagger.responses[400] = { description: 'roomName and participants are required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { roomId } = req.params;
    const data = req.body;

    console.log(roomId, data);
    if (!roomId || !data) {
      throw new AppError(400, "Room ID and data are required");
    }

    const auth = (req as any).auth as { userId: string; role?: string[] };
    const isStaff =
      auth.role?.some((r) => ["ADMIN", "MANAGER", "LAB_USER"].includes(r)) ??
      false;

    const room = await roomService.updateRoom(
      roomId,
      data,
      auth.userId,
      isStaff
    );
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Room Service']
    #swagger.description = 'Delete a room'
    #swagger.parameters['roomId'] = {
      in: 'path',
      description: 'Room ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[201] = {
      description: 'Room deleted successfully',
      schema: {
        message: 'Room deleted',
        data: {
          _id: 'string',
          name: 'string',
          participants: ['string']
        }
      }
    }
    #swagger.responses[400] = { description: 'roomName and participants are required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { roomId } = req.params;
    const auth = (req as any).auth as { userId: string; role?: string[] };
    const isStaff =
      auth.role?.some((r) => ["ADMIN", "MANAGER", "LAB_USER"].includes(r)) ??
      false;

    await roomService.deleteRoom(roomId, auth.userId, isStaff || false);
    res.status(201).json({ message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  joinChat,
  getRooms,
  getRoomsByCreator,
  getRoomsByParticipant,
  createRoom,
  updateRoom,
  deleteRoom,
  leaveChat,
};
