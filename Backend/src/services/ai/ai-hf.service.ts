import { HF_API_KEY, HF_MODEL, HF_BASE_URL } from "../../config/env";
import { AIAction } from "../../dto/ai/ai-request.dto";

interface BuildPromptParams {
  action: AIAction;
  pageTitle: string;
  pageContent: string;
  selectedText?: string;
  customPrompt?: string;
  questionCount?: number;
}

class AIHuggingFaceService {
  private buildSystemPrompt(action?: AIAction): string {
    if (action === "generate-quiz") {
      return `You are Synapse AI, a quiz generator. 
You create high-quality multiple choice questions based on given content.
You ALWAYS respond with valid JSON only — no markdown, no explanation, no text outside the JSON.`;
    }

    return `You are Synapse AI, a helpful writing assistant embedded in a notes application.
You help users understand, organize, and create content.
Be concise, clear, and well-structured.
Use markdown formatting (headings, bullets, bold) when appropriate.
Never mention that you're an AI unless asked.`;
  }

  private buildUserPrompt(params: BuildPromptParams): string {
    const { action, pageTitle, pageContent, selectedText, customPrompt, questionCount } = params;

    const context = `---
Page Title: ${pageTitle || "Untitled"}
Page Content:
${pageContent || "(empty page)"}
${selectedText ? `\nSelected Text:\n${selectedText}` : ""}
---`;

    const prompts: Record<AIAction, string> = {
      summarize: `Summarize the following page in clear, concise bullet points using markdown.
Use "- " for bullets. Keep it under 8 bullets. No tables. No headings unless truly needed.

${context}`,

      "key-takeaways": `Extract 3-5 key takeaways from this page.
Format as a numbered list "1. ", "2. " etc. Be specific and actionable.
No tables. No headings.

${context}`,

      "action-items": `Extract all action items, tasks, and to-dos from this page.
Format each as: "- [ ] task description"
No tables. No introductory text. Just the checklist.

${context}`,

      explain: selectedText
        ? `Explain the following selected text in simple, easy-to-understand language.
Write as flowing paragraphs. No tables. No lists unless truly needed.
Selected text: "${selectedText}"

Full page context:
${context}`
        : `Explain the key concepts in this page in simple language.
Write as flowing paragraphs. Use plain text. No tables.

${context}`,

      "write-from-prompt": `Write the following, using the page context for style and relevance:

REQUEST: ${customPrompt}

Format naturally with paragraphs, bullet lists, or headings as appropriate.
Do NOT use tables. Do NOT wrap in "here's what I wrote" — just write it directly.

Context:
${context}`,

      "generate-outline": `Generate a detailed hierarchical outline for this topic.

TOPIC: ${customPrompt || pageTitle}

Format:
# Main Title
## Section 1
- Point A
- Point B
## Section 2
- Point A
- Point B

Use markdown headings and bullets. NO tables. NO introductory text.

Context:
${context}`,

      brainstorm: `Brainstorm 8-10 creative ideas about: ${customPrompt || pageTitle}

Format each idea as:
### Idea Name
Brief description (1-2 sentences).

No tables. No introductory text. Just the ideas with headings and descriptions.

Context:
${context}`,

      "generate-quiz": `Generate exactly ${questionCount || 5} multiple choice questions based on the content below.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation, no text outside the JSON
2. Each question must have exactly 4 options
3. Only ONE correct answer per question
4. correctIndex is 0-based (0, 1, 2, or 3)
5. Questions should test understanding, not just memorization
6. Include a brief explanation for each answer
7. Vary the correct answer position (don't always make it option A)

JSON FORMAT (respond EXACTLY like this):
{
  "topic": "brief topic name",
  "questions": [
    {
      "question": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this is the correct answer."
    }
  ]
}

CONTENT TO USE:
${context}

Respond with ONLY the JSON. Nothing else.`,

      custom: `Answer this question clearly and concisely:

QUESTION: ${customPrompt}

Use the page context if relevant. Format naturally (paragraphs, bullets if appropriate).
Do NOT use tables. Do NOT include "Answer:" or "Here's the answer:" prefixes.

Context:
${context}`,
    };

    return prompts[action];
  }

  async streamCompletion(params: BuildPromptParams): Promise<Response> {
    const response = await fetch(HF_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: this.buildSystemPrompt(params.action) },
          { role: "user", content: this.buildUserPrompt(params) },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HuggingFace API error: ${response.status} — ${errText}`);
    }

    return response;
  }

  // Non-streaming completion — used for quiz (needs full JSON)
  async getCompletion(params: BuildPromptParams): Promise<string> {
    const response = await fetch(HF_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: this.buildSystemPrompt(params.action) },
          { role: "user", content: this.buildUserPrompt(params) },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HuggingFace API error: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export default new AIHuggingFaceService();