import { Request, Response } from "express";

import registerService from "../../services/auth/register.service";

class RegisterController {
  async register(req: Request, res: Response) {
    const dto = req.body;

    await registerService.register(dto);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  }

  async verifyRegister(req: Request, res: Response) {
    const dto = req.body;

    const auth = await registerService.verifyRegister(dto,res);

    res.cookie("accessToken", auth.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", auth.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: auth.user,
    });
  }
}

export default new RegisterController();