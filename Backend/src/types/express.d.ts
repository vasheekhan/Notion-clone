import "express";
import { Profile } from "passport-google-oauth20";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }

    interface User extends Profile {}
  }
}

export {};