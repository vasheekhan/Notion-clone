import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { env } from "./env";
import { GoogleLoginDto } from "../dto/auth/google-login.dto";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },

     async(accessToken,refreshToken,profile,done)=>{

        done(null,profile);

    })
);

export default passport;