import { Request, Response } from "express";

import googleService from "../../services/auth/google.service";
import { env } from "../../config/env";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

class GoogleController {
  async googleCallback(req: Request, res: Response) {
    const profile = req.user!;

    const dto = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? "",
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value,
    };

    const auth = await googleService.loginWithGoogle(dto);

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

    return res.redirect(`${env.frontendURL}/dashboard`);
  }
}

export default new GoogleController();