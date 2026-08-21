import bcrypt from "bcrypt";
import { Response } from "express";
import prisma from "../../config/database";
import { env } from "../../config/env";

import { User } from "../../generated/prisma/client";
import { AuthResponseDto } from "../../dto/auth/auth-response.dto";
import { UpdateProfileDto } from "../../dto/auth/update-profile.dto";
import { ChangePasswordDto } from "../../dto/auth/change-password.dto";

import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

class SessionService {
  async createSession(user: User, res?: Response): Promise<AuthResponseDto> {
    const accessToken = generateAccessToken({
      userId: user.id,
    });

    const { tokenId, rawToken } = generateRefreshToken();

    const refreshTokenHash = await bcrypt.hash(
      rawToken,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenId,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + THIRTY_DAYS),
      },
    });

    const refreshToken = `${tokenId}.${rawToken}`;

    // Set cookies if response object is provided
    if (res) {
       const isProduction = env.NODE_ENV === "production";
      console.log("COOKIE DEBUG — isProduction:", isProduction, "| env.NODE_ENV:", JSON.stringify(env.NODE_ENV));
      
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: FIFTEEN_MINUTES,
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax", 
        maxAge: THIRTY_DAYS,
        path: "/",
      });
    }

    // Return the auth data (not the response)
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(rawCookieToken: string): Promise<AuthResponseDto> {
    console.log("========== REFRESH TOKEN ==========");

    if (!rawCookieToken) {
      console.log("REFRESH TOKEN: missing");
      throw new Error("Refresh token missing");
    }

    console.log("REFRESH TOKEN EXISTS:", true);
    console.log("REFRESH TOKEN LENGTH:", rawCookieToken.length);
    console.log("HAS DOT:", rawCookieToken.includes("."));

    const dotIndex = rawCookieToken.indexOf(".");

    if (dotIndex === -1) {
      console.log("REFRESH TOKEN: malformed, no dot");
      throw new Error("Malformed refresh token");
    }

    const tokenId = rawCookieToken.substring(0, dotIndex);
    const rawToken = rawCookieToken.substring(dotIndex + 1);

    console.log("TOKEN ID:", tokenId);
    console.log("RAW TOKEN LENGTH:", rawToken.length);

    if (!tokenId || !rawToken) {
      console.log("REFRESH TOKEN: malformed parts");
      throw new Error("Malformed refresh token");
    }

    const session = await prisma.session.findUnique({
      where: {
        tokenId,
      },
      include: {
        user: true,
      },
    });

    console.log("SESSION FOUND:", !!session);

    if (!session) {
      console.log("NO SESSION FOUND FOR TOKEN ID:", tokenId);
      throw new Error("Invalid refresh token");
    }

    if (new Date() > session.expiresAt) {
      console.log("REFRESH TOKEN: expired");

      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });

      throw new Error("Refresh token expired");
    }

    const isValid = await bcrypt.compare(rawToken, session.refreshTokenHash);

    console.log("BCRYPT VALID:", isValid);

    if (!isValid) {
      console.log("REFRESH TOKEN: hash mismatch");
      throw new Error("Invalid refresh token");
    }

    const accessToken = generateAccessToken({
      userId: session.user.id,
    });

    const { tokenId: newTokenId, rawToken: newRawToken } = generateRefreshToken();

    const refreshTokenHash = await bcrypt.hash(
      newRawToken,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        tokenId: newTokenId,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + THIRTY_DAYS),
      },
    });

    console.log("REFRESH TOKEN: successfully rotated");
    console.log("NEW TOKEN ID:", newTokenId);

    return {
      user: session.user,
      accessToken,
      refreshToken: `${newTokenId}.${newRawToken}`,
    };
  }

  async getCurrentUser(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async logout(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const updateData: any = {};

    if (data.name !== undefined) {
      const trimmed = data.name.trim();

      if (trimmed.length < 2) {
        throw new Error("Name must be at least 2 characters");
      }

      updateData.name = trimmed;
    }

    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No fields to update");
    }

    return prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    if (!data.oldPassword || !data.newPassword) {
      throw new Error("Both old and new passwords are required");
    }

    if (data.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.passwordHash) {
      throw new Error("This account uses Google Sign-In and has no password");
    }

    const isValid = await bcrypt.compare(data.oldPassword, user.passwordHash);

    if (!isValid) {
      throw new Error("Old password is incorrect");
    }

    const newHash = await bcrypt.hash(
      data.newPassword,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash: newHash,
      },
    });

    return {
      success: true,
    };
  }
}

export default new SessionService();