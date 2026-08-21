import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "./env";

const isProduction = env.NODE_ENV === "production";

const getSslConfig = () => {
  if (!isProduction) return undefined;

  if (process.env.DB_CA_CERT) {
    return {
      ca: process.env.DB_CA_CERT,
      rejectUnauthorized: true,
    };
  }

  try {
    const fs = require("fs");
    const path = require("path");

    return {
      ca: fs.readFileSync(path.join(process.cwd(), "ca.pem"), "utf-8"),
      rejectUnauthorized: true,
    };
  } catch (err) {
    console.error("Could not load CA certificate:", err);
    return undefined;
  }
};

// DATABASE ADAPTER
const adapter = new PrismaMariaDb({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  // CONNECTION CONFIGURATION
  connectTimeout: 30000,
  connectionLimit: isProduction ? 20 : 10,
  acquireTimeout: 20000,
  // 🔥 REMOVED: timeout: 30000, // This property doesn't exist

  // CONNECTION POOL
  idleTimeout: 300000,
  minimumIdle: 2,

  // QUERY CONFIGURATION
  multipleStatements: false,
  dateStrings: false,

  // SSL
  ...(isProduction && getSslConfig() ? { ssl: getSslConfig() } : {}),
});

// PRISMA CLIENT
const basePrisma = new PrismaClient({
  adapter,

  log: [
    { level: "error", emit: "stdout" },
    ...(isProduction
      ? []
      : [
          { level: "warn", emit: "stdout" },
          { level: "query", emit: "stdout" },
        ]),
  ] as any,

  errorFormat: "pretty",
});

// QUERY PERFORMANCE MONITORING
const prisma = !isProduction
  ? basePrisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ operation, model, args, query }) {
            const before = Date.now();
            const result = await query(args);
            const after = Date.now();
            const duration = after - before;

            if (duration > 1000) {
              console.log(
                `🐌 Slow Query: ${model}.${operation} took ${duration}ms`
              );
            }

            return result;
          },
        },
      },
    })
  : basePrisma;

// CONNECTION LIFECYCLE MANAGEMENT
let isShuttingDown = false;

const gracefulShutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down database connections...");

  try {
    await prisma.$disconnect();
    console.log("Database connections closed successfully");
  } catch (error) {
    console.error("Error during database shutdown:", error);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("beforeExit", gracefulShutdown);

export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
};

export default prisma;