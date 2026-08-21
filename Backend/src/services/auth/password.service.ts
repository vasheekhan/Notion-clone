import bcrypt from "bcrypt";

import prisma from "../../config/database";
import { env } from "../../config/env";

import { ForgotPasswordDto } from "../../dto/auth/forgot-password.dto";
import { ResetPasswordDto } from "../../dto/auth/reset-password.dto";

import { generateOtp } from "../../utils/otp";

class PasswordService {
  async forgotPassword(data: ForgotPasswordDto) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const otp = generateOtp();

    console.log("\n==================================");
    console.log("🔐 FORGOT PASSWORD OTP");
    console.log("Email:", data.email);
    console.log("User:", user.name);
    console.log("OTP:", otp);
    console.log("==================================\n");

    const codeHash = await bcrypt.hash(
      otp,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    await prisma.verificationCode.deleteMany({
      where: {
        email: data.email,
        type: "FORGOT_PASSWORD",
      },
    });

    await prisma.verificationCode.create({
      data: {
        email: data.email,
        name: user.name,
        passwordHash: user.passwordHash!,
        codeHash,
        type: "FORGOT_PASSWORD",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    console.log("OTP saved");

    // Email is skipped on purpose so you can test without Gmail/SMTP.
    // Use the OTP printed above.

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async resetPassword(data: ResetPasswordDto) {
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email: data.email,
        type: "FORGOT_PASSWORD",
      },
    });

    if (!verification) {
      throw new Error("OTP not found");
    }

    const isValidOtp = await bcrypt.compare(
      data.otp,
      verification.codeHash
    );

    if (!isValidOtp) {
      throw new Error("Invalid OTP");
    }

    if (verification.expiresAt < new Date()) {
      throw new Error("OTP has expired");
    }

    const passwordHash = await bcrypt.hash(
      data.newPassword,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    await prisma.user.update({
      where: {
        email: data.email,
      },
      data: {
        passwordHash,
      },
    });

    await prisma.verificationCode.delete({
      where: {
        id: verification.id,
      },
    });

    console.log("Password reset successfully");

    return {
      success: true,
      message: "Password reset successfully",
    };
  }
}

export default new PasswordService();