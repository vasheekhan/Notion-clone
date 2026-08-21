import { Request, Response } from "express";

import pageTrashService from "../../services/page/page-trash.service";

interface IdParams {
  id: string;
}

class PageTrashController {


async permanentDelete(
  req: Request<IdParams>,
  res: Response
) {
  await pageTrashService.permanentDelete(
    req.userId!,
    req.params.id
  );

  return res.json({
    success: true,
    message: "Page permanently deleted",
  });
}

  async restore(
    req: Request<IdParams>,
    res: Response
  ) {
    const page = await pageTrashService.restore(
      req.userId!,
      req.params.id
    );

    return res.json({
      success: true,
      page,
    });
  }

async getTrash(
  req: Request,
  res: Response
) {
  const pages = await pageTrashService.getTrash(
    req.userId!
  );

  return res.json({
    success: true,
    pages,
  });
}
}

export default new PageTrashController();