import { HF_API_KEY, HF_MODEL, HF_BASE_URL } from "../../config/env";
import { AIAction } from "../../dto/ai/ai-stream.dto";

interface BuildPromptParams {
  action: AIAction;
  pageTitle: string;
  pageContent: string;
  selectedText?: string;
  customPrompt?: string;
}

class AIService {
  private buildSystemPrompt(): string {
    return `You are Synapse AI, a helpful writing assistant embedded in a notes application. 
You help users understand, organize, and create content.
Be concise, clear, and well-structured. 
Use markdown formatting (headings, bullets, bold) when appropriate.
Never mention that you're an AI unless asked.`;
  }

  private buildUserPrompt(params: BuildPromptParams): string {
    const { action, pageTitle, pageContent, selectedText, customPrompt } = params;

    const context = `---
Page Title: ${pageTitle || "Untitled"}
Page Content:
${pageContent || "(empty)"}
${selectedText ? `\nSelected Text:\n${selectedText}` : ""}
---`;

    const prompts: Record<AIAction, string> = {
      summarize: `Summarize the following page in clear, concise bullet points.\n\n${context}`,

      "key-takeaways": `Extract 3-5 key takeaways from this page. Be specific and actionable.\n\n${context}`,

      "action-items": `Extract all action items, tasks, and to-dos from this page. Format as a checklist using "- [ ]" syntax.\n\n${context}`,

      explain: selectedText
        ? `Explain the following selected text in simpler terms. Use the full page as context.\n\n${context}`
        : `Explain the key concepts in this page in simple, easy-to-understand language.\n\n${context}`,

      "write-from-prompt": `Based on the context of this page, write the following:\n\n${customPrompt}\n\n${context}`,

      "generate-outline": `Generate a detailed outline for the following topic, considering the existing page context.\n\nTopic: ${
        customPrompt || pageTitle
      }\n\n${context}`,

      brainstorm: `Brainstorm 8-10 creative ideas related to this page's topic. Be creative and diverse.\n\n${context}`,

      custom: `${customPrompt}\n\n${context}`,
    };

    return prompts[action];
  }

  async streamCompletion(params: BuildPromptParams): Promise<Response> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(params);

    const response = await fetch(HF_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HuggingFace API error: ${response.status} — ${error}`);
    }

    return response;
  }

  // Generate a short title for a conversation (used when creating new ones)
  async generateTitle(firstUserMessage: string): Promise<string> {
    try {
      const response = await fetch(HF_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: [
            {
              role: "system",
              content:
                "Generate a very short title (3-6 words max) for this conversation. Reply with ONLY the title, no quotes, no punctuation.",
            },
            { role: "user", content: firstUserMessage.slice(0, 200) },
          ],
          temperature: 0.5,
          max_tokens: 20,
          stream: false,
        }),
      });

      if (!response.ok) return "New conversation";

      const data = await response.json();
      const title = data.choices?.[0]?.message?.content?.trim();
      return title?.slice(0, 60) || "New conversation";
    } catch {
      return "New conversation";
    }
  }
}

export default new AIService();