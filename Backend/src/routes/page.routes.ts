import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";

import pageController from "../controllers/page/page.controller";
import pageContentController from "../controllers/page/page-content.controller";
import pageTrashController from "../controllers/page/page-trash.controller";
import pageMoveController from "../controllers/page/page-move.controller";

const router = Router();

router.use(authMiddleware.authenticate);

router.post("/", pageController.create);

router.get(
  "/workspace/:workspaceId",
  pageController.findAll
);

router.get(
  "/trash",
  pageTrashController.getTrash
);

router.patch(
  "/:id/restore",
  pageTrashController.restore
);

router.delete(
  "/:id/permanent",
  pageTrashController.permanentDelete
);

router.put(
  "/:id/content",
  pageContentController.updateContent
);

router.get(
  "/:id/content",
  pageContentController.getContent
);

router.patch(
  "/:id/move",
  pageMoveController.move
);

router.get(
  "/:id",
  pageController.findById
);

router.patch(
  "/:id",
  pageController.update
);

router.delete(
  "/:id",
  pageController.delete
);

export default router;