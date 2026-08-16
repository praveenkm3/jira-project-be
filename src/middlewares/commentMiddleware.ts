import type { NextFunction,Request ,Response} from "express";
import { AppDataSource } from "../config/db.ts";
import { Comments } from "../config/entities/Comments.ts";
import { ProjectMembers } from "../config/entities/ProjectMembers.ts";
import { AppError } from "./errorMiddleware.ts";

export async function requireCommentOwner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!commentId) {
      throw new AppError(400, "Comment ID is required");
    }

    const comment = await AppDataSource
      .getRepository(Comments)
      .findOne({
        where: {
          comment_id: commentId as string
        },
        relations: {
          created: true,
          issue_id: {
            project: true,
          },
        },
      });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }
    const isMember = await AppDataSource
      .getRepository(ProjectMembers)
      .existsBy({
        project: {
          project_id: comment.issue_id.project.project_id,
        },
        user: {
          id: userId as string
        },
      });

    if (!isMember) {
      throw new AppError(
        403,
        "You are not a member of this project",
      );
    }

    if (comment.created.id !== userId) {
      throw new AppError(
        403,
        "Not Allowed to modify other comment",
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}