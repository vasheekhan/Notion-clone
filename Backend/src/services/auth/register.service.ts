import bcrypt from "bcrypt";
import { Response } from "express";
import prisma from "../../config/database";
import { env } from "../../config/env";

import { RegisterDto } from "../../dto/auth/register.dto";
import { VerifyRegisterDto } from "../../dto/auth/verify-register.dto";
import { AuthResponseDto } from "../../dto/auth/auth-response.dto";

import { generateOtp } from "../../utils/otp";
import { sendOtpMail } from "../../utils/sendmail";

import sessionService from "./session.service";

class RegisterService {
  async register(data: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(
      data.password,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    console.log("Password hashed");

    // 3. Generate OTP
    const otp = generateOtp();

    console.log("Generated OTP:", otp);

    // 4. Hash OTP
    const codeHash = await bcrypt.hash(
      otp,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    console.log("Hashed OTP");

    // 5. Delete previous OTP
    await prisma.verificationCode.deleteMany({
      where: {
        email: data.email,
      },
    });

    // 6. Save verification
    await prisma.verificationCode.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        codeHash,
        type: "REGISTER",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    console.log("OTP saved to database");

    // 7. Await email delivery so Vercel does not freeze execution
    try {
      await sendOtpMail(data.email, data.name, otp);
      console.log("OTP email sent successfully");
    } catch (err: any) {
      console.error("⚠️ Email sending failed:", err.message);
      throw new Error("Failed to send OTP email: " + err.message);
    }

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async verifyRegister(
    data: VerifyRegisterDto,
    res: Response
  ): Promise<AuthResponseDto> {
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email: data.email,
        type: "REGISTER",
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

    const user = await prisma.user.create({
      data: {
        email: verification.email,
        name: verification.name,
        passwordHash: verification.passwordHash,
      },
    });

    await prisma.verificationCode.delete({
      where: {
        id: verification.id,
      },
    });

    return sessionService.createSession(user);
  }
}

export default new RegisterService();