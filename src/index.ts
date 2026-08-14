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
import commentRouter from "./routes/comment.routes.ts";
import notifyRouter from "./routes/notifications.routes.ts";
import { refresh } from "./controllers/auth.controller.ts";

const ALLOWED_ORIGIN=process.env.ALLOWED_ORIGIN
const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin:ALLOWED_ORIGIN,
    credentials:true,
}));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth/',authRouter);
app.post('/api/refresh',refresh);

app.use(authMiddleware);

app.use('/api/project',projectRouter);
app.use('/api/project',memberRouter);
app.use('/api/issues',issueRouter);
app.use('/api/',userRouter);
app.use('/api/issues',commentRouter); 
app.use('/api/notifications',notifyRouter)
app.use(errorHandler);
try {
    await AppDataSource.initialize();
    console.log("database connected");

    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    });
} catch (error) {
    console.error("Connection failed:", error);
};