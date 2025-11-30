import type { NextFunction, Request, Response } from "express";
import { RoleService } from "../services/role.service.js";
import { AppError } from "../utils/error.util.js";
import { PaginationUtils } from "../utils/pagination.util.js";
import { AuthenticatedUser } from "../types/authenticatedUser.type.js";

const roleService = new RoleService();

const getRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Role CRUD']
    #swagger.description = 'Get role by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Role ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Role retrieved successfully',
      schema: {
        _id: 'string',
        roleCode: 'string',
        roleName: 'string',
        description: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        privileges: 'string',
        isActive: 'boolean',
        isSystemRole: 'boolean'
      }
    }
    #swagger.responses[400] = { description: 'Role ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'Role not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const roleId = req.params.id;
    if (!roleId) {
      throw new AppError(400, 'Role ID is required');
    }

    const role = await roleService.getRole(roleId);
    if (!role) {
      throw new AppError(404, 'Role not found');
    }

    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};

const getRolesWithPagination = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Role CRUD']
    #swagger.description = 'Get roles with pagination'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of roles per page (1-100)',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['cursor'] = {
      in: 'query',
      description: 'Cursor for next page (role ID)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Field to sort by',
      required: false,
      type: 'string',
      enum: ['updatedAt', '_id', 'roleCode', 'roleName'],
      default: 'updatedAt'
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Search term to filter roles',
      required: false,
      type: 'string'
    }
    #swagger.parameters['searchField'] = {
      in: 'query',
      description: 'Fields to search by',
      required: false,
      type: 'string',
      enum: ['roleCode', 'roleName', 'privileges'],
      default: 'roleName'
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
      description: 'Roles retrieved successfully',
      schema: {
        data: {
          type: 'array',
          items: {
            _id: 'string',
            roleCode: 'string',
            roleName: 'string',
            description: 'string',
            createdAt: 'string',
            updatedAt: 'string',
            isActive: 'boolean',
            isSystemRole: 'boolean'
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
    const roles = await roleService.getRolesWithPagination(options);
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Role CRUD']
    #swagger.description = 'Create a new role'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Role data',
      required: true,
      schema: {
        roleCode: 'USER',
        roleName: 'Test Role',
        description: 'Test Role',
        privileges: [''],
        isActive: true,
        isSystemRole: false,
      }
    }
    #swagger.responses[201] = {
      description: 'Role created successfully',
      schema: {
        message: 'Role created successfully!',
        roleId: 'string'
      }
    }
    #swagger.responses[400] = { description: 'Bad request or missing required fields' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const roleData = req.body;
    const newRole = await roleService.createRole(
      roleData,
      (req.user as AuthenticatedUser)?._id
    );
    res.status(201).json({
      message: "Role created successfully!",
      roleId: newRole._id,
    });
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Role CRUD']
    #swagger.description = 'Update role by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Role ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Role update data',
      required: false,
      schema: {
        roleCode: 'USER',
        roleName: 'Test Role',
        description: 'Test Role',
        privileges: [''],
        isActive: true,
        isSystemRole: false,
      }
    }
    #swagger.responses[200] = {
      description: 'Role updated successfully',
      schema: {
        message: 'Role updated successfully!',
        roleId: 'string',
        privileges: 'array',
        isActive: 'boolean',
        isSystemRole: 'boolean'
      }
    }
    #swagger.responses[400] = { description: 'Role ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'Role not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const roleId = req.params.id;
    if (!roleId) {
      throw new AppError(400, 'Role ID is required');
    }

    const roleData = req.body;
    const updatedRole = await roleService.updateRole(
      roleId,
      roleData,
      (req.user as AuthenticatedUser)?._id
    );

    if (!updatedRole) {
      throw new AppError(404, 'Role not found');
    }

    res.status(200).json({
      message: "Role updated successfully!",
      roleId: updatedRole._id,
      isActive: updatedRole.isActive,
    });
  } catch (error) {
    next(error);
  }
};

const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Role CRUD']
    #swagger.description = 'Delete role by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Role ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Role deleted successfully',
      schema: {
        message: 'Role deleted successfully!',
        roleId: 'string'
      }
    }
    #swagger.responses[400] = { description: 'Role ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'Role not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const roleId = req.params.id;
    if (!roleId) {
      throw new AppError(400, 'Role ID is required');
    }

    const deletedRole = await roleService.deleteRole(
      roleId,
      (req.user as AuthenticatedUser)?._id
    );
    if (!deletedRole) {
      throw new AppError(404, 'Role not found');
    }

    res.status(200).json({
      message: "Role deleted successfully!",
      roleId: deletedRole._id,
    });
  } catch (error) {
    next(error);
  }
};

const assignPrivilegesToRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Additional']
    #swagger.description = 'Assign privileges to role'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Role ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Role update data',
      required: false,
      schema: {
        privileges: [''],
      }
    }
    #swagger.responses[200] = {
      description: 'Role updated successfully',
      schema: {
        message: 'Role updated successfully!',
        roleId: 'string',
        privileges: 'array',
        isActive: 'boolean',
        isSystemRole: 'boolean'
      }
    }
    #swagger.responses[400] = { description: 'Role ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'Role not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const roleId = req.params.id;
    if (!roleId) {
      throw new AppError(400, 'Role ID is required');
    }

    const privileges = req.body.privileges;
    const updatedRole = await roleService.assignPrivilegesToRole(
      roleId,
      privileges,
      (req.user as AuthenticatedUser)?._id
    );

    if (!updatedRole) {
      throw new AppError(404, 'Role not found');
    }

    res.status(200).json({
      message: "Role updated successfully!",
      roleId: updatedRole._id,
      isActive: updatedRole.isActive,
    });
  } catch (error) {
    next(error);
  }
};

const removePrivileges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Additional']
    #swagger.description = 'Remove privileges from role'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Role ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Role update data',
      required: false,
      schema: {
        privileges: [''],
      }
    }
    #swagger.responses[200] = {
      description: 'Role updated successfully',
      schema: {
        message: 'Role updated successfully!',
        roleId: 'string',
        privileges: 'array',
        isActive: 'boolean',
        isSystemRole: 'boolean'
      }
    }
    #swagger.responses[400] = { description: 'Role ID is required' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[404] = { description: 'Role not found' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const roleId = req.params.id;
    if (!roleId) {
      throw new AppError(400, 'Role ID is required');
    }

    const privileges = req.body.privileges;
    const updatedRole = await roleService.removePrivilegesFromRole(
      roleId,
      privileges,
      (req.user as AuthenticatedUser)?._id
    );

    if (!updatedRole) {
      throw new AppError(404, 'Role not found');
    }

    res.status(200).json({
      message: "Role updated successfully!",
      roleId: updatedRole._id,
      isActive: updatedRole.isActive,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolesWithPagination,
  assignPrivilegesToRole,
  removePrivileges,
};
