export type AIAction =
  | "summarize"
  | "key-takeaways"
  | "action-items"
  | "explain"
  | "write-from-prompt"
  | "generate-outline"
  | "brainstorm"
  | "custom";

export interface AIStreamRequestDto {
  action: AIAction;
  pageId?: string;
  pageTitle: string;
  pageContent: string;
  selectedText?: string;
  customPrompt?: string;
  conversationId?: string; 
}