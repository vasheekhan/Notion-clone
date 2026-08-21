import express from "express";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware";
import workspaceRoutes from "./routes/workspace.routes";
import pageRoutes from "./routes/page.routes";
import cors from "cors";
import uploadRoutes from "./routes/upload.routes";
import aiRoutes from "./routes/ai.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://notion-clone-1-g9dx.onrender.com",
  "https://synapse-six-tau.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use((req, res, next) => {
  
  next();
});

// Root route so visiting the base URL in browser returns 200 OK
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notion Clone API is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/upload", uploadRoutes);

// Catch-all 404 handler for any unhandled route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found - ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

export default app;