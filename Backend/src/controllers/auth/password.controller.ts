import { Request, Response } from "express";

import passwordService from "../../services/auth/password.service";

class PasswordController {
  async forgotPassword(req: Request, res: Response) {
    const dto = req.body;

    await passwordService.forgotPassword(dto);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  }

  async resetPassword(req: Request, res: Response) {
    const dto = req.body;

    await passwordService.resetPassword(dto);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  }
}

export default new PasswordController();