import prisma from "../../config/database";

class PageTrashService {
 
  async restore(
    userId: string,
    pageId: string
  ) {
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        isDeleted: true,
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!page) {
      throw new Error("Page not found");
    }

    return prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

async getTrash(userId: string) {
  return prisma.page.findMany({
    where: {
      isDeleted: true,
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    orderBy: {
      deletedAt: "desc",
    },
  });
}

async permanentDelete(
  userId: string,
  pageId: string
) {
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      isDeleted: true,
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
  });

  if (!page) {
    throw new Error("Page not found");
  }

  await prisma.page.delete({
    where: {
      id: pageId,
    },
  });
}
}

export default new PageTrashService();