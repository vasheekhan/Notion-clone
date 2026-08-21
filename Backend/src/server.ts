import app from "./app";
import prisma from "./config/database";
import { env } from "./config/env";
import { generateOtp } from "./utils/otp";

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected");
    console.log(generateOtp());
console.log("NODE_ENV:", env.NODE_ENV, typeof env.NODE_ENV);
    app.listen(Number(env.PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();