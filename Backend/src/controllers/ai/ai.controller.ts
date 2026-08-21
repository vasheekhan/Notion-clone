import { Request, Response } from "express";
import aiHfService from "../../services/ai/ai-hf.service";
import aiConversationService from "../../services/ai/ai-conversation.service";
import { AIAction, AIStreamRequestDto } from "../../dto/ai/ai-request.dto";

const VALID_ACTIONS: AIAction[] = [
  "summarize",
  "key-takeaways",
  "action-items",
  "explain",
  "write-from-prompt",
  "generate-outline",
  "brainstorm",
  "generate-quiz",
  "custom",
];

class AIController {
  async stream(req: Request, res: Response) {
    const userId = req.userId!;
    const {
      action,
      pageId,
      pageTitle,
      pageContent,
      selectedText,
      customPrompt,
      conversationId,
    }: AIStreamRequestDto = req.body;

    // Validation
    if (!action || !VALID_ACTIONS.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action`,
      });
    }

    if (
      ["write-from-prompt", "generate-outline", "custom"].includes(action) &&
      !customPrompt?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "customPrompt is required for this action",
      });
    }

    // Setup SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    let fullResponse = "";
    let conversation;

    try {
      // Create or continue conversation
      if (conversationId) {
        conversation = await aiConversationService.getConversation(
          conversationId,
          userId
        );
        if (!conversation) {
          res.write(
            `data: ${JSON.stringify({ error: "Conversation not found" })}\n\n`
          );
          res.write("data: [DONE]\n\n");
          return res.end();
        }
      } else {
        conversation = await aiConversationService.createConversation(
          userId,
          pageId,
          this.generateTitle(action, customPrompt)
        );

        // Send conversation ID to client so it can save it
        res.write(
          `data: ${JSON.stringify({ conversationId: conversation.id })}\n\n`
        );
      }

      // Save user message
      const userMessageContent = customPrompt || this.actionToLabel(action);
      await aiConversationService.addMessage(
        conversation.id,
        "user",
        userMessageContent,
        action
      );

      // Stream from HF
      const hfResponse = await aiHfService.streamCompletion({
        action,
        pageTitle: pageTitle || "",
        pageContent: pageContent || "",
        selectedText,
        customPrompt,
      });

      const reader = hfResponse.body?.getReader();
      if (!reader) {
        res.write(`data: ${JSON.stringify({ error: "No stream" })}\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // skip
          }
        }
      }

      // Save assistant message after streaming completes
      if (fullResponse.trim()) {
        await aiConversationService.addMessage(
          conversation.id,
          "assistant",
          fullResponse
        );
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("AI stream error:", error);

      // Save whatever we got even on error
      if (fullResponse.trim() && conversation) {
        await aiConversationService
          .addMessage(conversation.id, "assistant", fullResponse)
          .catch(() => {});
      }

      if (res.headersSent) {
        res.write(
          `data: ${JSON.stringify({ error: error.message || "AI request failed" })}\n\n`
        );
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        res.status(500).json({
          success: false,
          message: error.message || "AI request failed",
        });
      }
    }
  }

  
  async listConversations(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const pageId = req.query.pageId as string | undefined;

      const conversations = await aiConversationService.listConversations(
        userId,
        pageId
      );

      return res.json({ success: true, conversations });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to list conversations",
      });
    }
  }

  async getConversation(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;  // ← add "as string"

    const conversation = await aiConversationService.getConversation(
      id,
      userId
    );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      return res.json({ success: true, conversation });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get conversation",
      });
    }
  }

  // src/controllers/ai/ai.controller.ts
// ADD THIS METHOD to your existing class (don't replace anything else)

async generateQuiz(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { pageId, pageTitle, pageContent, selectedText, questionCount } =
      req.body;

    if (!pageContent && !selectedText) {
      return res.status(400).json({
        success: false,
        message: "Page content is required to generate a quiz",
      });
    }

    const count = Math.min(Math.max(questionCount || 5, 3), 10); // clamp 3-10

    const rawResponse = await aiHfService.getCompletion({
      action: "generate-quiz",
      pageTitle: pageTitle || "",
      pageContent: pageContent || "",
      selectedText,
      questionCount: count,
    });

    // Try to parse the JSON — handle common issues
    let quiz;
    try {
      // Remove markdown code fences if present
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
      if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      quiz = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse quiz JSON:", rawResponse);
      return res.status(500).json({
        success: false,
        message: "AI generated invalid quiz format. Please try again.",
      });
    }

    // Validate structure
    if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI generated an empty quiz. Please try again.",
      });
    }

    // Validate each question
    for (const q of quiz.questions) {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctIndex !== "number" ||
        q.correctIndex < 0 ||
        q.correctIndex > 3
      ) {
        return res.status(500).json({
          success: false,
          message: "AI generated malformed questions. Please try again.",
        });
      }
    }

    // Save conversation (optional but nice)
    const conversation = await aiConversationService.createConversation(
      userId,
      pageId,
      `Quiz: ${quiz.topic || pageTitle || "Untitled"}`
    );

    await aiConversationService.addMessage(
      conversation.id,
      "user",
      `Generate ${count} quiz questions`,
      "generate-quiz"
    );

    await aiConversationService.addMessage(
      conversation.id,
      "assistant",
      JSON.stringify(quiz)
    );

    return res.json({
      success: true,
      quiz,
      conversationId: conversation.id,
    });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate quiz",
    });
  }
}
  async deleteConversation(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;  // ← add "as string"

    await aiConversationService.deleteConversation(id, userId);

      return res.json({ success: true, message: "Conversation deleted" });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete",
      });
    }
  }

  // Helpers
  private generateTitle(action: AIAction, customPrompt?: string): string {
    if (customPrompt) {
      return customPrompt.slice(0, 50) + (customPrompt.length > 50 ? "..." : "");
    }
    return this.actionToLabel(action);
  }

  private actionToLabel(action: AIAction): string {
  const map: Record<AIAction, string> = {
    summarize: "Summarize page",
    "key-takeaways": "Extract key takeaways",
    "action-items": "Find action items",
    explain: "Explain this",
    "write-from-prompt": "Write content",
    "generate-outline": "Generate outline",
    brainstorm: "Brainstorm ideas",
    "generate-quiz": "Generate quiz",   // ← ADD THIS
    custom: "Custom question",
  };
  return map[action];
}
}

export default new AIController();