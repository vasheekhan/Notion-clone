import prisma from "../../config/database";
import { CreatePageDto } from "../../dto/page/create-page.dto";
import { UpdatePageDto } from "../../dto/page/update-page.dto";

class PageService {
  
  // OPTIMIZED: Reusable access verification
  private async verifyWorkspaceAccess(userId: string, workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      select: { id: true }
    });
    
    if (!workspace) {
      throw new Error("Workspace not found or access denied");
    }
    return workspace;
  }

  async create(userId: string, data: CreatePageDto) {
    // Verify workspace access
    await this.verifyWorkspaceAccess(userId, data.workspaceId);

    // If parentId provided, verify parent exists and is in same workspace
    if (data.parentId) {
      const parent = await prisma.page.findFirst({
        where: {
          id: data.parentId,
          workspaceId: data.workspaceId,
          isDeleted: false,
        },
        select: { id: true }
      });

      if (!parent) {
        throw new Error("Parent page not found");
      }
    }

    // Get next position for ordering
    const maxPosition = await prisma.page.aggregate({
      where: {
        workspaceId: data.workspaceId,
        parentId: data.parentId,
        isDeleted: false,
      },
      _max: { position: true }
    });

    return prisma.page.create({
      data: {
        title: data.title ?? "Untitled",
        workspaceId: data.workspaceId,
        authorId: userId,
        parentId: data.parentId,
        position: (maxPosition._max.position ?? 0) + 1,
        icon: data.icon,
      },
      select: {
        id: true,
        title: true,
        icon: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        authorId: true,
        parentId: true,
      }
    });
  }

  // MASSIVELY OPTIMIZED: Single query using composite index
  async findAll(userId: string, workspaceId: string) {
    // Verify access
    await this.verifyWorkspaceAccess(userId, workspaceId);

    // OPTIMIZED: Uses composite index [workspaceId, isDeleted]
    return prisma.page.findMany({
      where: {
        workspaceId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        icon: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        authorId: true,
        workspaceId: true,
      },
      orderBy: [
        { position: "asc" },
        { createdAt: "asc" },
      ],
    });
  }

  async findById(userId: string, pageId: string) {
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        isDeleted: false,
        workspace: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        icon: true,
        coverImage: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        authorId: true,
        parentId: true,
      }
    });

    if (!page) {
      throw new Error("Page not found");
    }

    return page;
  }

  async update(userId: string, pageId: string, data: UpdatePageDto) {
    // Verify access first
    await this.findById(userId, pageId);

    return prisma.page.update({
      where: { id: pageId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      },
      select: {
        id: true,
        title: true,
        icon: true,
        coverImage: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        authorId: true,
        parentId: true,
      }
    });
  }

  // MASSIVELY OPTIMIZED: Single recursive CTE query
  async delete(userId: string, pageId: string) {
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        isDeleted: false,
        workspace: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        },
      },
      select: { id: true, workspaceId: true }
    });

    if (!page) {
      throw new Error("Page not found");
    }

    const now = new Date();

    // OPTIMIZED: Single recursive query to mark all descendants as deleted
    await prisma.$executeRaw`
      UPDATE Page 
      SET isDeleted = true, deletedAt = ${now}
      WHERE id IN (
        WITH RECURSIVE page_tree AS (
          SELECT id FROM Page WHERE id = ${pageId}
          UNION ALL
          SELECT p.id FROM Page p
          INNER JOIN page_tree pt ON p.parentId = pt.id
          WHERE p.isDeleted = false
        )
        SELECT id FROM page_tree
      )
    `;
  }
}

export default new PageService();