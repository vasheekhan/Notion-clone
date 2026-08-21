import prisma from "../../config/database";

class AIConversationService {
  async createConversation(userId: string, pageId?: string, title?: string) {
    return prisma.aIConversation.create({
      data: {
        userId,
        pageId: pageId || null,
        title: title || "New conversation",
      },
    });
  }

  async getConversation(conversationId: string, userId: string) {
    return prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  async listConversations(userId: string, pageId?: string) {
    return prisma.aIConversation.findMany({
      where: {
        userId,
        ...(pageId ? { pageId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    action?: string
  ) {
    const message = await prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
        action: action || null,
      },
    });

    // bump conversation updatedAt
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async updateTitle(conversationId: string, userId: string, title: string) {
    return prisma.aIConversation.updateMany({
      where: { id: conversationId, userId },
      data: { title },
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    return prisma.aIConversation.deleteMany({
      where: { id: conversationId, userId },
    });
  }
}

export default new AIConversationService();