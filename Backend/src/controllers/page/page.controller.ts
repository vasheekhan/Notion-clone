import { Request, Response } from "express";

import pageService from "../../services/page/page.service";

interface IdParams {
  id: string;
}

interface WorkspaceParams {
  workspaceId: string;
}

class PageController {

  async create(req: Request, res: Response) {
    const page = await pageService.create(
      req.userId!,
      req.body
    );

    return res.status(201).json({
      success: true,
      page,
    });
  }

  async findAll(
    req: Request<WorkspaceParams>,
    res: Response
  ) {
    const pages = await pageService.findAll(
      req.userId!,
      req.params.workspaceId
    );

    return res.json({
      success: true,
      pages,
    });
  }


  async findById(
    req: Request<IdParams>,
    res: Response
  ) {
    const page = await pageService.findById(
      req.userId!,
      req.params.id
    );

    return res.json({
      success: true,
      page,
    });
  }


  async update(
    req: Request<IdParams>,
    res: Response
  ) {
    const page = await pageService.update(
      req.userId!,
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      page,
    });
  }


  async delete(
    req: Request<IdParams>,
    res: Response
  ) {
    await pageService.delete(
      req.userId!,
      req.params.id
    );

    return res.json({
      success: true,
      message: "Page deleted successfully",
    });
  }
}

export default new PageController();