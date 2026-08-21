import { Request, Response } from "express";
import prisma from "../../config/database";
import workspaceService from "../../services/workspace/workspace.service";
import { UpdateWorkspaceDto } from "../../dto/workspace/update-workspace.dto";
interface WorkspaceParams {
  id: string;
}
class WorkspaceController {

  async create(req: Request, res: Response) {
    const workspace = await workspaceService.create(
      req.userId!,
      req.body
    );

    return res.status(201).json({
      success: true,
      workspace,
    });
  }

  async findAll(req: Request, res: Response) {
    const workspaces = await workspaceService.findAll(
      req.userId!
    );

    return res.json({
      success: true,
      workspaces,
    });
  }

  async findById(req: Request<WorkspaceParams>, res: Response) {
    const workspace = await workspaceService.findById(
      req.userId!,
      req.params.id
    );

    return res.json({
      success: true,
      workspace,
    });
  }
async update(
  req: Request<{ id: string }>,
  res: Response
) {
  const workspace = await workspaceService.update(
    req.userId!,
    req.params.id,
    req.body
  );

  return res.json({
    success: true,
    workspace,
  });
}
async delete(
  req: Request<{ id: string }>,
  res: Response
) {
  await workspaceService.delete(
    req.userId!,
    req.params.id
  );

  return res.json({
    success: true,
    message: "Workspace deleted successfully",
  });
}
}

export default new WorkspaceController();