import prisma from "../../config/database";
import { GoogleLoginDto } from "../../dto/auth/google-login.dto";
import { AuthResponseDto } from "../../dto/auth/auth-response.dto";
import sessionService from "./session.service";

class GoogleService {
  async loginWithGoogle(data: GoogleLoginDto): Promise<AuthResponseDto> {
    // 1. Find existing Google account
    let user = await prisma.user.findUnique({
      where: { googleId: data.googleId },
    });

    // 2. If Google account doesn't exist, find existing user by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: data.email },
      });
    }

    // 3. Existing user -> link Google account if needed
    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: data.googleId,
            avatar: data.avatar,
          },
        });
      }
    }

    // 4. No existing account -> create one
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: data.googleId,
          email: data.email,
          name: data.name,
          avatar: data.avatar,
        },
      });
    }

    return sessionService.createSession(user);
  }
}

export default new GoogleService();