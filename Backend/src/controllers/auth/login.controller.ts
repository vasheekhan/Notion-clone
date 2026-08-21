import { Request, Response } from "express";
import { env } from "../../config/env";
import loginService from "../../services/auth/login.service";

class LoginController {
  async login(req: Request, res: Response) {
    try {
      const dto = req.body;

      const auth = await loginService.login(dto, res);

      res.cookie("accessToken", auth.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", auth.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        user: auth.user,
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err instanceof Error ? err.message : "Login failed",
      });
    }
  }
}

export default new LoginController();