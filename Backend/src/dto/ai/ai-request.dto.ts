// In src/dto/ai/ai-request.dto.ts

export type AIAction =
  | "summarize"
  | "key-takeaways"
  | "action-items"
  | "explain"
  | "write-from-prompt"
  | "generate-outline"
  | "brainstorm"
  | "generate-quiz"  
  | "custom";

export interface AIStreamRequestDto {
  action: AIAction;
  pageId?: string;
  pageTitle: string;
  pageContent: string;
  selectedText?: string;
  customPrompt?: string;
  conversationId?: string;
  questionCount?: number;  
}