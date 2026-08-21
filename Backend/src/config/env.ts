import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

const NODE_ENV = (process.env.NODE_ENV ?? "development") as
  | "development"
  | "production"
  | "test";

export const env = {
  PORT: process.env.PORT || "5000",
  DB_USER: getEnv("DB_USER"),
  DB_PORT: getEnv("DB_PORT"),
  DB_HOST: getEnv("DB_HOST"),
  DB_PASSWORD: getEnv("DB_PASSWORD"),
  DB_NAME: getEnv("DB_NAME"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  frontendURL: getEnv("FRONTEND_URL"),
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  BCRYPT_SALT_ROUNDS: getEnv("BCRYPT_SALT_ROUNDS"),
  NODE_ENV,
  isProd: NODE_ENV === "production",
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
};

export const HF_API_KEY = process.env.HF_API_KEY ?? "";
export const HF_MODEL = process.env.HF_MODEL || "openai/gpt-4o-120b";
export const HF_BASE_URL =
  process.env.HF_BASE_URL ||
  "https://router.huggingface.co/v1/chat/completions";