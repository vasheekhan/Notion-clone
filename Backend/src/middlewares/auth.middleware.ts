import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

class AuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      const payload = verifyAccessToken(accessToken);
      req.userId = payload.userId;
      return next();
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired access token" });
    }
  }
}

export default new AuthMiddleware();