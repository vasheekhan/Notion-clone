import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import aiController from "../controllers/ai/ai.controller";

const router = Router();

router.use(authMiddleware.authenticate);

router.post("/stream", (req, res) => aiController.stream(req, res));
router.post("/quiz", (req, res) => aiController.generateQuiz(req, res));  // ← ADD THIS

router.get("/conversations", (req, res) =>
  aiController.listConversations(req, res)
);
router.get("/conversations/:id", (req, res) =>
  aiController.getConversation(req, res)
);
router.delete("/conversations/:id", (req, res) =>
  aiController.deleteConversation(req, res)
);

export default router;