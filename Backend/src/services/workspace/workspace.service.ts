import prisma from "../../config/database";
import { UpdateWorkspaceDto } from "../../dto/workspace/update-workspace.dto";

interface CreateWorkspaceDto {
  name: string;
  icon?: string;
}

class WorkspaceService {
  
  async create(userId: string, data: CreateWorkspaceDto) {
    // OPTIMIZED: Single transaction with both workspace and membership creation
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          icon: data.icon,
          ownerId: userId,
        },
        select: {
          id: true,
          name: true,
          icon: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
        }
      });

      // Create workspace membership (assuming you have WorkspaceMember model)
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: userId,
          role: "OWNER", // Adjust based on your role enum
        },
      });

      return workspace;
    });
  }

  // OPTIMIZED: Single query with optimized joins
  async findAll(userId: string) {
    return prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { 
            members: { 
              some: { 
                userId,
                // Add any role-based filtering if needed
              } 
            } 
          }
        ]
      },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        _count: {
          select: {
            pages: {
              where: {
                isDeleted: false
              }
            },
            members: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(userId: string, workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: userId },
          { 
            members: { 
              some: { userId } 
            } 
          }
        ]
      },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
      }
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }

  async update(userId: string, workspaceId: string, data: UpdateWorkspaceDto) {
    // Verify access first
    await this.findById(userId, workspaceId);

    return prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.icon !== undefined && { icon: data.icon }),
      },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
      }
    });
  }

  async delete(userId: string, workspaceId: string) {
    const workspace = await this.findById(userId, workspaceId);
    
    // Only owner can delete workspace
    if (workspace.ownerId !== userId) {
      throw new Error("Only workspace owner can delete workspace");
    }

    // OPTIMIZED: Cascading delete handled by Prisma schema
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });
  }
}

export default new WorkspaceService();