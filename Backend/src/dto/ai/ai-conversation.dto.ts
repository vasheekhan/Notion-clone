export interface CreateConversationDto {
  userId: string;
  pageId?: string;
  title?: string;
}

export interface AIMessageDto {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string | null;
  createdAt: Date;
}

export interface AIConversationDto {
  id: string;
  title: string;
  pageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: AIMessageDto[];
}