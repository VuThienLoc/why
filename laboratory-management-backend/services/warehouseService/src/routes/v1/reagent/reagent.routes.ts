import express from "express";
import { ReagentController } from "../../../controllers/reagent/reagent.controller.js";
import authenticateUser from "../../../middlewares/authenticate.middleware.js";
import { isInternalApiKeyValid } from "../../../middlewares/internalApi.middleware.js";

const reagent = new ReagentController();
const router = express.Router();

const authorizeWriteAccess = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (isInternalApiKeyValid(req)) {
    next();
    return;
  }

  authenticateUser.authenticateUser(req, res, next);
};


router.get(
  "/search",
  /*
  #swagger.tags = ['Reagents']
  #swagger.summary = 'Search reagents'
  #swagger.description = 'Search reagents by keyword with pagination.'

  #swagger.parameters['keyword'] = {
    in: 'query',
    description: 'Keyword to search (name, code, etc.)',
    required: true,
    type: 'string',
    example: 'Diluent'
  }

  #swagger.parameters['page'] = {
    in: 'query',
    description: 'Page number',
    required: false,
    type: 'integer',
    example: 1
  }

  #swagger.parameters['limit'] = {
    in: 'query',
    description: 'Items per page',
    required: false,
    type: 'integer',
    example: 10
  }

  #swagger.responses[200] = {
    description: 'Search results returned successfully',
    schema: {
      success: true,
    }
  }

  #swagger.responses[400] = {
    description: 'Missing keyword',
    schema: {
      success: false,
      message: "Keyword is required"
    }
  }

  #swagger.responses[500] = { description: 'Server error' }
  */
  reagent.searchReagents.bind(reagent)
);

router.get(
  "/",
  /*
  #swagger.tags = ['Reagents']
  #swagger.summary = 'Get all reagents (with pagination)'
  #swagger.description = `
    Retrieve a paginated list of reagents in the system.
    You can specify query parameters to control pagination:
    - \`page\`: Page number (default = 1)
    - \`limit\`: Number of items per page (default = 10)
  `

  #swagger.parameters['page'] = {
    in: 'query',
    description: 'Page number for pagination (default = 1)',
    required: false,
    type: 'integer',
    example: 2
  }

  #swagger.parameters['limit'] = {
    in: 'query',
    description: 'Number of items per page (default = 10)',
    required: false,
    type: 'integer',
    example: 10
  }

  #swagger.parameters['keyword'] = {
    in: 'query',
    description: 'Optional keyword to filter by name, barcode, or notes',
    required: false,
    type: 'string',
    example: 'Diluent'
  }
  */
  reagent.getAllReagents
);


router.get(
  "/:id",
  /*
  #swagger.tags = ['Reagents']
  #swagger.summary = 'Get reagent by ID'
  #swagger.description = 'Retrieve details of a specific reagent by its ID.'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'Reagent ID',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'Reagent details retrieved successfully',
    schema: {
      success: true,
    }
  }
  #swagger.responses[404] = {
    description: 'Reagent not found'
  }
  */
  reagent.getReagentById
);

router.post(
  "/",
  /*
  #swagger.tags = ['Reagents']
  #swagger.summary = 'Create a new reagent'
  #swagger.description = 'Add a new reagent to the system. If low_stock_threshold is not provided, it will default to 10% of quantity_current.'
  #swagger.parameters['body'] = {
  in: 'body',
  description: 'Reagent object that needs to be added',
  required: true,
  schema: {
  "reagent_name": "Diluent Solution",
  "reagent_type": "Diluent",
  "quantity_current": 5000,
  "unit_of_measure": "ml",
  "expiration_date": "2026-10-01T00:00:00.000Z",
  "received_date": "2025-10-01T09:00:00.000Z",
  "status": "Available",
  "low_stock_threshold": 500,
  "storage_location": "Shelf A - Lab Room 1"
  }
  }
  #swagger.responses[201] = {
  description: 'Reagent created successfully',
  schema: {
  success: true,
  }
  }
  #swagger.responses[400] = {
  description: 'Invalid input data'
  }
  */
  authorizeWriteAccess,
  reagent.createReagent
);

router.put(
  "/:id",
  /*
  #swagger.tags = ['Reagents']
  #swagger.summary = 'Update a reagent'
  #swagger.description = 'Update an existing reagent by ID. Status, updated_at, and updated_by are automatically handled.'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'Reagent ID to update',
    required: true,
    type: 'string'
  }
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Fields to update',
    required: true,
    schema: {
      "reagent_name": "Updated Diluent Solution",
      "quantity_current": 4500,
      "unit_of_measure": "ml",
      "expiration_date": "2026-10-01T00:00:00.000Z",
      "received_date": "2025-10-01T09:00:00.000Z",
      "low_stock_threshold": 500,
      "storage_location": "Shelf A - Lab Room 1"
    }
  }
  #swagger.responses[200] = {
    description: 'Reagent updated successfully',
    schema: {
      success: true,
    }
  }
  #swagger.responses[404] = { description: 'Reagent not found' }
  #swagger.responses[500] = { description: 'Server error' }
  */
  authorizeWriteAccess,
  reagent.updateReagent
);


router.delete(
  "/:id",
  /*
  #swagger.tags = ['Reagents']
  #swagger.summary = 'Soft delete a reagent'
  #swagger.description = 'Mark a reagent as deleted without removing it from the database.'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'Reagent ID to be soft deleted',
    required: true,
    type: 'string'
  }
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Optional info about who deletes the reagent',
    required: false,
    schema: {
      deleted_by: "USER001"
    }
  }
  #swagger.responses[200] = {
    description: 'Reagent soft deleted successfully',
    schema: {
      success: true,
    }
  }
  #swagger.responses[404] = {
    description: 'Reagent not found'
  }
  #swagger.responses[500] = {
    description: 'Server error'
  }
  */
  authorizeWriteAccess,
  reagent.deleteReagent
);








export default router;