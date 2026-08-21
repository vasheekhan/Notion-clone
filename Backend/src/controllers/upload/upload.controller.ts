import { Request, Response } from "express";
import uploadService from "../../services/upload/upload.service";

class UploadController {
  async uploadImage(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Determine folder based on query param (or default)
    const folder = (req.query.folder as string) || "synapse/general";

    const url = await uploadService.uploadImage(
      req.file.buffer,
      `synapse/${folder}`
    );

    return res.json({
      success: true,
      url,
    });
  }
}

export default new UploadController();