import prisma from "../../config/database";

import { MovePageDto } from "../../dto/page/move-page.dto";

class PageMoveService {
 
  async move(
    userId: string,
    pageId: string,
    data: MovePageDto
  ) {
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        isDeleted: false,
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

    // Prevent making a page its own parent
    if (data.parentId === pageId) {
      throw new Error("A page cannot be its own parent");
    }

    // If parent is provided, verify it exists
    if (data.parentId) {
      const parent = await prisma.page.findFirst({
        where: {
          id: data.parentId,
          workspaceId: page.workspaceId,
          isDeleted: false,
        },
      });

      if (!parent) {
        throw new Error("Parent page not found");
      }
    }

    return prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        parentId: data.parentId ?? null,
        position: data.position,
      },
    });
  }
}

export default new PageMoveService();