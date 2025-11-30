import express from "express";
import { getLog, deleteLog, getLogsWithPagination } from "../../controllers/log.controller.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

/*
  #swagger.tags = ['Audit Logs']
  #swagger.security = [{"apiKeyAuth": []}]
*/

const router = express.Router();

router.get('/all', authorize(['system:admin']), getLogsWithPagination);
router.get('/:id', authorize(['system:admin']), getLog);

router.delete('/delete/:id', authorize(['system:admin']), deleteLog);

export default router;