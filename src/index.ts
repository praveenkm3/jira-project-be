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


const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin:"http://localhost:5175",
    credentials:true,
}));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth/',authRouter);

app.use(authMiddleware);

app.use('/api/project',projectRouter);
app.use('/api/project',memberRouter);
app.use('/api/issues',issueRouter);
app.use('/api/',userRouter);
app.use('/api/issues',commentRouter); 
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