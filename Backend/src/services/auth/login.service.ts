import bcrypt from "bcrypt";
import { Response } from "express";
import prisma from "../../config/database";

import { LoginDto } from "../../dto/auth/login.dto";
import { AuthResponseDto } from "../../dto/auth/auth-response.dto";

import sessionService from "./session.service";

class LoginService {
  async login(data: LoginDto, res: Response): Promise<AuthResponseDto> {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 2. Check if this account has a password
    if (!user.passwordHash) {
      throw new Error("This account uses Google Sign-In");
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // 4. Create session and get auth data
    const authData = await sessionService.createSession(user, res);

    // 5. Return the auth data (not the response)
    return authData;
  }
}

export default new LoginService();