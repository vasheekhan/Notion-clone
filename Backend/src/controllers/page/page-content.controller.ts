import { Request, Response } from "express";

import pageContentService from "../../services/page/page-content.service";

interface IdParams {
  id: string;
}

class PageContentController {

  async updateContent(
    req: Request<IdParams>,
    res: Response
  ) {
    const page =
      await pageContentService.updateContent(
        req.userId!,
        req.params.id,
        req.body
      );

    return res.json({
      success: true,
      page,
    });
  }


  async getContent(
    req: Request<IdParams>,
    res: Response
  ) {
    const content =
      await pageContentService.getContent(
        req.userId!,
        req.params.id
      );

    return res.json({
      success: true,
      content,
    });
  }
}

export default new PageContentController();