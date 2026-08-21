import { Request, Response } from "express";

import pageMoveService from "../../services/page/page-move.service";
import { MovePageDto } from "../../dto/page/move-page.dto";

interface IdParams {
  id: string;
}

class PageMoveController {

  async move(
    req: Request<IdParams, {}, MovePageDto>,
    res: Response
  ) {
    const page = await pageMoveService.move(
      req.userId!,
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      page,
    });
  }
}

export default new PageMoveController();