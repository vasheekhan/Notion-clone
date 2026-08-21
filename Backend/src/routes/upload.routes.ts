import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";
import uploadController from "../controllers/upload/upload.controller";

const router = Router();

router.use(authMiddleware.authenticate);

router.post(
  "/image",
  upload.single("image"),
  uploadController.uploadImage
);

export default router;