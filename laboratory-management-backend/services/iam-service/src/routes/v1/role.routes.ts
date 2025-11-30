import express from "express";
import { getRole,createRole, updateRole, deleteRole, getRolesWithPagination, assignPrivilegesToRole, removePrivileges } from "../../controllers/role.controller.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validateCreateRole, validateUpdateRole } from "../../middlewares/validate.middleware.js";

/*
  #swagger.tags = ['Role CRUD']
  #swagger.security = [{"apiKeyAuth": []}]
*/

const router = express.Router();

router.get('/all', authorize(['read:role']), getRolesWithPagination);
router.get('/:id', authorize(['read:role']), getRole);

router.post('/create', authorize(['create:role']), validateCreateRole, createRole);
router.put('/update/:id', authorize(['update:role']), validateUpdateRole, updateRole);
router.delete('/delete/:id', authorize(['delete:role']), deleteRole);

router.put('/assign/:id', authorize(['update:role']), validateUpdateRole, assignPrivilegesToRole);
router.put('/remove/:id', authorize(['update:role']), validateUpdateRole, removePrivileges);

export default router;