import { Router } from "express";
import { addComment,deleteComment,editComment } from "../controllers/comment.controllers.ts";



const commentRouter = Router();
 
commentRouter.post("/:issueId/comments", addComment);
commentRouter.patch("/comments/:commentId", editComment);
commentRouter.delete("/comments/:commentId", deleteComment);

export default commentRouter;
