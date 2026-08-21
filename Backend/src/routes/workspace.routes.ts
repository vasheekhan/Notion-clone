import { Router } from "express";

import authmiddleware from "../middlewares/auth.middleware";

import workspaceController from "../controllers/workspace/workspace.controller";

const router = Router();

router.use(authmiddleware.authenticate);

router.post("/", workspaceController.create);

router.get("/", workspaceController.findAll);

router.get("/:id", workspaceController.findById);

router.patch("/:id", workspaceController.update);

router.delete("/:id", workspaceController.delete);

export default router;