import express from "express";
import multer from "multer";
import {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUsersWithPagination,
  getUserRolesAndPrivileges,
  getCurrentUserRolesAndPrivileges,
  assignRoleToUser,
  lockUser,
  updateProfile,
  uploadAvatar,
  getStaff,
  getCurrentUser,
} from "../../controllers/user.controller.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../../middlewares/validate.middleware.js";

/*
  #swagger.tags = ['User CRUD']
  #swagger.security = [{"apiKeyAuth": []}]
*/

const router = express.Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

router.get("/all", authorize(["read:user"]), getUsersWithPagination);
router.get("/me/roles", getCurrentUserRolesAndPrivileges);
router.get("/staff", getStaff);
router.get("/:id/roles", authorize(["read:user"]), getUserRolesAndPrivileges);
router.get("/:id", authorize(["read:user"]), getUser);

router.get("/profile/:userId", getCurrentUser);
router.put("/profile", validateUpdateUser, updateProfile);
router.post("/profile/avatar", avatarUpload.single("avatar"), uploadAvatar);

router.post(
  "/create",
  authorize(["create:user"]),
  validateCreateUser,
  createUser
);
router.put(
  "/update/:id",
  authorize(["update:user"]),
  validateUpdateUser,
  updateUser
);
router.delete("/delete/:id", authorize(["delete:user"]), deleteUser);

router.put("/assign-role/:id", authorize(["update:user"]), assignRoleToUser);
router.put("/lock/:id", authorize(["update:user"]), lockUser);

export default router;
