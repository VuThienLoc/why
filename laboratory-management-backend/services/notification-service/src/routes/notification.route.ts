import express from "express";
import { createNotification, listNotifications, markNotificationAsRead, deleteNotification, createNotificationMany } from "../../src/controllers/notification.controller.js";

/*
  #swagger.tags = ['Notification Service']
*/

const router = express.Router();

router.post('/create/:userId', createNotification);
router.post('/many/create', createNotificationMany);
router.get('/list', listNotifications);
router.patch(
  '/:notificationId',
  markNotificationAsRead
);

router.delete(
  '/:notificationId',
  deleteNotification
);

export default router;