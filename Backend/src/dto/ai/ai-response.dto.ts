export interface AIConversationDto {
  id: string;
  title: string;
  pageId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessageDto {
  id: string;
  role: "user" | "assistant";
  content: string;
  action: string | null;
  createdAt: Date;
}