import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
}

const ACCESS_EXPIRES = "15m" as const;

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign({ userId: payload.userId }, env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
};

export const generateRefreshToken = (): { tokenId: string; rawToken: string } => {
  const tokenId = crypto.randomBytes(16).toString("hex");
  const rawToken = crypto.randomBytes(48).toString("hex");
  return { tokenId, rawToken };
};