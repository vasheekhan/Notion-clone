import prisma from "../../config/database";

import { UpdateContentDto } from "../../dto/page/update-content.dto";

class PageContentService {

async getContent(
  userId: string,
  pageId: string
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
    select: {
      content: true,
    },
  });

  if (!page) {
    throw new Error("Page not found");
  }

  return page.content;
}

 
  async updateContent(
    userId: string,
    pageId: string,
    data: UpdateContentDto
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

    return prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        content: data.content,
      },
    });
  }
}

export default new PageContentService();