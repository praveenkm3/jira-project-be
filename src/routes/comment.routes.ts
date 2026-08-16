import { Router } from "express";
import { addComment,deleteComment,editComment,getComment } from "../controllers/comment.controllers.ts";
import { requireCommentOwner } from "../middlewares/commentMiddleware.ts";


const commentRouter = Router();
 
commentRouter.post("/:issueId", addComment);
commentRouter.get("/:issueId", getComment);
commentRouter.patch("/edit/:commentId",requireCommentOwner, editComment);
commentRouter.delete("/delete/:commentId",requireCommentOwner, deleteComment);

export default commentRouter;
