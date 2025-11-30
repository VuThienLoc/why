import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { AppError } from "../utils/error.util.js";
import patientServiceClient from "../services/patientService.client.js";
import { ROLE_CODES } from "../constants/roles.constant.js";
import { PaginationUtils } from "../utils/pagination.util.js";
import { AuthenticatedUser } from "../types/authenticatedUser.type.js";
import cloudinary from "../config/cloudinary.config.js";

const userService = new UserService();

const resolveActorContext = (
  req: Request
): { id?: string; email?: string } | undefined => {
  const user = req.user as AuthenticatedUser | undefined;
  if (!user) {
    return undefined;
  }
  return {
    id: String(user._id),
    email: user.email,
  };
};

const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User Profile']
    #swagger.description = 'Get profile information of the authenticated user'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.responses[200] = {
      description: 'Authenticated user profile retrieved successfully',
      schema: {
        user: {
          _id: 'string',
          email: 'string',
          fullName: 'string',
          identityNumber: 'string',
          gender: 'Male',
          age: 22,
          dateOfBirth: '2002-01-01',
          phoneNumber: '0123456789',
          address: 'string',
          avatar: 'https://example.com/avatar.png',
          role: ['USER']
        }
      }
    }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const currentUser = req.user as AuthenticatedUser | undefined;
    if (!currentUser?._id) {
      throw new AppError(401, "Unauthorized: User not found");
    }

    const user = await userService.getUser(currentUser._id);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User CRUD']
    #swagger.description = 'Get user by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'User retrieved successfully',
      schema: {
        _id: 'string',
        email: 'string',
        fullName: 'string',
        identityNumber: 'string',
        gender: 'Male',
        age: 22,
        dateOfBirth: '2002-01-01',
        phoneNumber: '0123456789',
        address: 'string',
        avatar: 'https://example.com/avatar.png',
        role: ['USER'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    }
    #swagger.responses[400] = { description: 'User ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const userId = req.params.id || (req.user as AuthenticatedUser)?._id;
    if (!userId) {
      throw new AppError(400, "User ID is required");
    }

    const user = await userService.getUser(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Return in consistent format for internal API calls
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const searchUsersInternal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const keywordRaw = req.query.q;
    const limitRaw = req.query.limit;

    const keyword = typeof keywordRaw === "string" ? keywordRaw : "";
    const limit = typeof limitRaw === "string" ? Number(limitRaw) : undefined;

    if (keyword.trim().length === 0) {
      res.json({ users: [] });
      return;
    }

    const safeLimit =
      Number.isFinite(limit) && limit
        ? Math.min(Math.max(Math.floor(limit), 1), 50)
        : 20;
    const users = await userService.searchUsersByFullName(keyword, safeLimit);
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const getUsersWithPagination = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User CRUD']
    #swagger.description = 'Get users with pagination'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of users per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (user ID)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['updatedAt', '_id', 'fullName', 'email'],
      default: 'updatedAt'
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Search term to filter users',
      required: false,
      type: 'string'
    }
    #swagger.parameters['searchField'] = {
      in: 'query',
      description: 'Fields to search by',
      required: false,
      type: 'string',
      enum: ['email', 'fullName'],
      default: 'fullName'
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
            email: 'string',
            fullName: 'string',
            identityNumber: 'string',
            gender: 'Male',
            age: 22,
            dateOfBirth: '2002-01-01',
            phoneNumber: '0123456789',
            address: 'string',
            avatar: 'https://example.com/avatar.png',
            role: ['USER'],
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
    const options = PaginationUtils.parseQuery(req.query);
    const users = await userService.getUsersWithPagination(options);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User CRUD']
    #swagger.description = 'Get staffs with pagination (currently only for lab users)'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of users per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (user ID)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['updatedAt', '_id', 'fullName', 'email'],
      default: 'updatedAt'
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Search term to filter users',
      required: false,
      type: 'string'
    }
    #swagger.parameters['searchField'] = {
      in: 'query',
      description: 'Fields to search by',
      required: false,
      type: 'string',
      enum: ['email', 'fullName'],
      default: 'fullName'
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
            email: 'string',
            fullName: 'string',
            identityNumber: 'string',
            gender: 'Male',
            age: 22,
            dateOfBirth: '2002-01-01',
            phoneNumber: '0123456789',
            address: 'string',
            avatar: 'https://example.com/avatar.png',
            role: ['USER'],
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
    const options = PaginationUtils.parseQuery(req.query);
    options.filters = {
      role: { $in: ROLE_CODES.LAB_USER },
    };
    const users = await userService.getUsersWithPagination(options);
    res.json(users);
  } catch (error) {
    next(error);
  }
};


const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User CRUD']
    #swagger.description = 'Create a new user'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User data (matches createUserSchema)',
      required: true,
      schema: {
        email: 'user@example.com',
        fullName: 'John Doe',
        identityNumber: '012345678901',
        gender: 'Male',
        age: 22,
        dateOfBirth: '2002-01-01',
        phoneNumber: '0123456789',
        address: '123 Main St',
        password: 'secret123',
        role: ['USER']
      }
    }
    #swagger.responses[201] = {
      description: 'User created successfully',
      schema: {
        message: 'User created successfully!',
        userId: 'string'
      }
    }
    #swagger.responses[400] = { description: 'Bad request or missing required fields' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const userData = req.body;
    const newUser = await userService.createUser(
      userData,
      (req.user as AuthenticatedUser)?._id
    );
    console.log("[UserController] Created user role:", newUser.role);

    // Auto-create patient record only for normal users
    if (!newUser.role || newUser.role.includes(ROLE_CODES.USER)) {
      console.log("[UserController] Auto-creating patient for user role USER");
      await patientServiceClient.createPatientForUser(
        String(newUser._id),
        resolveActorContext(req)
      );
    }

    res.status(201).json({
      message: "User created successfully!",
      userId: newUser._id,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User CRUD']
    #swagger.description = 'Update user by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User update data (matches updateUserSchema)',
      required: false,
      schema: {
        email: 'user@example.com',
        fullName: 'John Doe',
        identityNumber: '012345678901',
        gender: 'Male',
        age: 22,
        dateOfBirth: '2002-01-01',
        phoneNumber: '0123456789',
        address: '123 Main St',
        avatar: 'https://example.com/avatar.png',
        password: 'secret123',
        isActive: true,
        role: ['USER']
      }
    }
    #swagger.responses[200] = {
      description: 'User updated successfully',
      schema: {
        message: 'User updated successfully!',
        userId: 'string'
      }
    }
    #swagger.responses[400] = { description: 'User ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new AppError(400, "User ID is required");
    }

    const userData = req.body;
    const updatedUser = await userService.updateUser(
      userId,
      userData,
      (req.user as AuthenticatedUser)?._id
    );

    if (!updatedUser) {
      throw new AppError(404, "User not found");
    }

    res.status(201).json({
      message: "User updated successfully!",
      userId: updatedUser._id,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User Profile']
    #swagger.description = 'Update current authenticated user profile'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Profile update data (uses updateUserSchema validator)',
      required: false,
      schema: {
        email: 'user@example.com',
        fullName: 'John Doe',
        identityNumber: '012345678901',
        gender: 'Male',
        age: 22,
        dateOfBirth: '2002-01-01',
        phoneNumber: '0123456789',
        address: '123 Main St',
        password: 'secret123',
        isActive: true,
      }
    }
    #swagger.responses[200] = {
      description: 'Profile updated successfully',
      schema: {
        message: 'Profile updated successfully!',
        userId: 'string'
      }
    }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const currentUser = req.user as AuthenticatedUser | undefined;
    if (!currentUser?._id) {
      throw new AppError(401, "Unauthorized: User not found");
    }

    const userData = req.body;
    const updatedUser = await userService.updateUser(
      currentUser._id,
      userData,
      currentUser._id
    );

    if (!updatedUser) {
      throw new AppError(404, "User not found");
    }

    res.status(201).json({
      message: "Profile updated successfully!",
      userId: updatedUser._id,
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
  #swagger.auto = false
  #swagger.tags = ['User Profile']
  #swagger.description = 'Update current authenticated user avatar'
  #swagger.security = [{"apiKeyAuth": []}]
  #swagger.consumes = ['multipart/form-data']
  #swagger.parameters['avatar'] = {
    in: 'formData',
    type: 'file',
    required: true,
    description: 'Avatar image file (max 5MB, image/*)'
  }
  #swagger.responses[200] = {
    description: 'Avatar updated successfully',
    schema: {
      message: 'Avatar updated successfully!',
      avatarUrl: 'https://res.cloudinary.com/.../image/upload/v123/avatar.png'
    }
  }
  #swagger.responses[401] = { description: 'Authentication required' }
  #swagger.responses[404] = { description: 'User not found' }
  #swagger.responses[500] = { description: 'Internal server error' }
*/
  try {
    const currentUser = req.user as AuthenticatedUser | undefined;
    if (!currentUser?._id) {
      throw new AppError(401, "Unauthorized: User not found");
    }

    const file = (req as any).file as any;
    if (!file || !file.buffer) {
      throw new AppError(400, "No avatar file uploaded");
    }

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            public_id: String(currentUser._id),
            overwrite: true,
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              return reject(new AppError(500, "Failed to upload avatar"));
            }
            resolve({ secure_url: result.secure_url });
          }
        );

        uploadStream.end(file.buffer);
      }
    );

    const updatedUser = await userService.updateUser(
      String(currentUser._id),
      { avatar: uploadResult.secure_url },
      String(currentUser._id)
    );

    if (!updatedUser) {
      throw new AppError(404, "User not found");
    }

    res.status(200).json({
      message: "Avatar updated successfully!",
      avatarUrl: uploadResult.secure_url,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User CRUD']
    #swagger.description = 'Delete user by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'User deleted successfully',
      schema: {
        message: 'User deleted successfully!',
        userId: 'string'
      }
    }
    #swagger.responses[400] = { description: 'User ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new AppError(400, "User ID is required");
    }

    const deletedUser = await userService.deleteUser(
      userId,
      (req.user as AuthenticatedUser)?._id
    );
    if (!deletedUser) {
      throw new AppError(404, "User not found");
    }

    if (!deletedUser.role || deletedUser.role.includes(ROLE_CODES.USER)) {
      await patientServiceClient.softDeletePatientByUserId(
        String(deletedUser._id),
        resolveActorContext(req)
      );
    }

    res.status(200).json({
      message: "User deleted successfully!",
      userId: deletedUser._id,
    });
  } catch (error) {
    next(error);
  }
};

const getUserRolesAndPrivileges = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User CRUD']
    #swagger.description = 'Get user roles and privileges by user ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'User roles and privileges retrieved successfully',
      schema: {
        userId: 'string',
        email: 'string',
        fullName: 'string',
        roles: [{
          _id: 'string',
          roleCode: 'string',
          roleName: 'string',
          description: 'string',
          privileges: ['string'],
          isActive: 'boolean',
          isSystemRole: 'boolean'
        }],
        aggregatedPrivileges: ['string']
      }
    }
    #swagger.responses[400] = { description: 'User ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new AppError(400, "User ID is required");
    }

    const result = await userService.getUserRolesAndPrivileges(userId);
    if (!result) {
      throw new AppError(404, "User not found");
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCurrentUserRolesAndPrivileges = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['User CRUD']
    #swagger.description = 'Get current authenticated user roles and privileges'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.responses[200] = {
      description: 'Current user roles and privileges retrieved successfully',
      schema: {
        userId: 'string',
        email: 'string',
        fullName: 'string',
        roles: [{
          _id: 'string',
          roleCode: 'string',
          roleName: 'string',
          description: 'string',
          privileges: ['string'],
          isActive: 'boolean',
          isSystemRole: 'boolean'
        }],
        aggregatedPrivileges: ['string']
      }
    }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const currentUser = req.user as AuthenticatedUser;
    if (!currentUser) {
      throw new AppError(401, "Not authenticated");
    }

    const result = await userService.getUserRolesAndPrivileges(currentUser._id);
    if (!result) {
      throw new AppError(404, "User not found");
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const assignRoleToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Additional']
    #swagger.description = 'Assign role to user'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Role data',
      required: true,
      schema: {
        role: ['string']
      }
    }
    #swagger.responses[200] = {
      description: 'Role assigned successfully',
      schema: {
        message: 'Role assigned successfully!',
        userId: 'string'
      }
    }
    #swagger.responses[400] = { description: 'User ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new AppError(400, "User ID is required");
    }

    const role = req.body.role;
    if (!role) {
      throw new AppError(400, "Role is required");
    }

    const result = await userService.assignRoleToUser(
      userId,
      role,
      (req.user as AuthenticatedUser)?._id
    );
    if (!result) {
      throw new AppError(404, "User not found");
    }

    res.status(200).json({
      message: "Role assigned successfully!",
      userId: result._id,
    });
  } catch (error) {
    next(error);
  }
};

const lockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Additional']
    #swagger.description = 'Lock user by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User active status',
      required: true,
      schema: {
        isActive: 'boolean'
      }
    }
    #swagger.responses[200] = {
      description: 'User locked successfully',
      schema: {
        message: 'User locked successfully!',
        userId: 'string'
      }
    }
    #swagger.responses[400] = { description: 'User ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new AppError(400, "User ID is required");
    }

    const isActive = req.body.isActive;
    const result = await userService.lockUser(
      userId,
      isActive,
      (req.user as AuthenticatedUser)?._id
    );
    if (!result) {
      throw new AppError(404, "User not found");
    }

    res.status(200).json({
      message: "User locked successfully!",
      userId: result._id,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getUser,
  getCurrentUser,
  searchUsersInternal,
  createUser,
  updateUser,
  updateProfile,
  uploadAvatar,
  deleteUser,
  getUsersWithPagination,
  getStaff,
  getUserRolesAndPrivileges,
  getCurrentUserRolesAndPrivileges,
  lockUser,
  assignRoleToUser,
};
