import express from "express";
import { sendMessage, getRoomMessages, updateMessage, deleteMessage } from "../../src/controllers/message.controller.js";
import { createValidator } from "../../../shared/src/middleware/validate.middleware.js";
import { createMessageSchema, updateMessageSchema } from "../../src/validators/message.validator.js";

/*
  #swagger.tags = ['Message Service']
*/

const router = express.Router();

router.post('/send/:roomId', createValidator(createMessageSchema), sendMessage);
router.get('/:roomId', getRoomMessages);
router.patch(
  '/:roomId/:messageId',
  createValidator(updateMessageSchema),
  updateMessage
);

router.delete(
  '/:roomId/:messageId',
  deleteMessage
);

export default router;