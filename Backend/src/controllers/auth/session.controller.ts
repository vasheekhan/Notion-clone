import { Request, Response } from "express";

import sessionService from "../../services/auth/session.service";
import { env } from "../../config/env";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

class SessionController {
  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const auth = await sessionService.refreshToken(refreshToken);

    res.cookie("accessToken", auth.accessToken, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: env.isProd ? "none" : "lax",
      maxAge: FIFTEEN_MINUTES,
      path: "/",
    });

    res.cookie("refreshToken", auth.refreshToken, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: env.isProd ? "none" : "lax",
      maxAge: THIRTY_DAYS,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      user: auth.user,
    });
  }

  async logout(req: Request, res: Response) {
    await sessionService.logout(req.userId!);

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: env.isProd,
      sameSite: env.isProd ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.isProd,
      sameSite: env.isProd ? "none" : "lax",
      path: "/",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  }

  async me(req: Request, res: Response) {
    const user = await sessionService.getCurrentUser(req.userId!);

    return res.json({
      success: true,
      user,
    });
  }

  async updateProfile(req: Request, res: Response) {
    const user = await sessionService.updateProfile(req.userId!, req.body);

    return res.json({
      success: true,
      user,
    });
  }

  async changePassword(req: Request, res: Response) {
    await sessionService.changePassword(req.userId!, req.body);

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  }
}

export default new SessionController();