import { Router } from "express";

import passport from "passport";

import authMiddleware from "../middlewares/auth.middleware";

import registerController from "../controllers/auth/register.controller";

import loginController from "../controllers/auth/login.controller";

import passwordController from "../controllers/auth/password.controller";

import googleController from "../controllers/auth/google.controller";

import sessionController from "../controllers/auth/session.controller";

const router = Router();

router.get(
  "/me",
  authMiddleware.authenticate,
  sessionController.me
);

router.get(
  "/google",
  (req, res, next) => {
    
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get("/successfull", (req, res) => {
  res.send("Login successful");
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  googleController.googleCallback
);

router.post(
  "/refresh",
  sessionController.refreshToken
);

router.post(
  "/logout",
  authMiddleware.authenticate,
  sessionController.logout
);

router.post(
  "/register",
  (req, res, next) => {
    
    next();
  },
  registerController.register
);

router.post(
  "/verify-register",
  registerController.verifyRegister
);

router.post(
  "/login",
  loginController.login
);

router.post(
  "/forgot-password",
  passwordController.forgotPassword
);

router.post(
  "/reset-password",
  passwordController.resetPassword
);

router.get(
  "/me",
  authMiddleware.authenticate,
  sessionController.me
);

router.patch(
  "/me",
  authMiddleware.authenticate,
  sessionController.updateProfile
);

router.patch(
  "/me/password",
  authMiddleware.authenticate,
  sessionController.changePassword
);

export default router;