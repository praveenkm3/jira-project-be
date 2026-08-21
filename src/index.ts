import express from "express";
import "dotenv/config";
import { AppDataSource } from "./config/db.ts";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorMiddleware.ts";
import { authMiddleware } from "./middlewares/authMiddleware.ts";
import authRouter from "./routes/auth.routes.ts";
import projectRouter from "./routes/project.routes.ts";
import memberRouter from "./routes/member.routes.ts";
import issueRouter from "./routes/issue.routes.ts";
import userRouter from "./routes/user.routes.ts";
import designationRouter from "./routes/designation.routes.ts";
import commentRouter from "./routes/comment.routes.ts";
import notifyRouter from "./routes/notifications.routes.ts";
import boardRouter from "./routes/dashboard.routes.ts";
import { refresh } from "./controllers/auth.controller.ts";
import helmet from "helmet";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import {
  authenticateWebsocket,
  addConnection,
  removeConnection,
} from "./services/websocket/websocket.services.ts";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const app = express();
const PORT = process.env.PORT;

app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth/", authRouter);
app.post("/api/refresh", refresh);

app.use(authMiddleware);

app.use("/api/project", projectRouter);
app.use("/api/project", memberRouter);
app.use("/api/issues", issueRouter);
app.use("/api/", userRouter);
app.use("/api/comments", commentRouter);
app.use("/api/notifications", notifyRouter);
app.use("/api/boards", boardRouter);
app.use("/designations", designationRouter);
app.use(errorHandler);
try {
  await AppDataSource.initialize();

  const server = createServer(app);
  const web_socket = new WebSocketServer({ server });

  web_socket.on("connection", async (socket, request) => {
    const cookieHeader = request.headers.cookie;
    const user_id: string = (await authenticateWebsocket(
      cookieHeader!,
    )) as string;

    addConnection(user_id, socket);

    socket.on("close", () => {
      removeConnection(user_id);
    });
  });

  server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Connection failed:", error);
}
