import { commentsRepo, projectMemberRepo, issueRepo } from "../config/repos.ts";
import { Comments } from "../config/entities/Comments.ts";
import { ProjectMembers } from "../config/entities/ProjectMembers.ts";
import { AppDataSource } from "../config/db.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { Issues } from "../config/entities/Issues.ts";

export async function addCommentService(
  issueId: string,
  userId: string,
  comment: string,
) {
  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const check1 = await manager.existsBy(Issues, {
        issue_id: issueId,
        project: {
          members: {
            user: {
              id: userId,
            },
          },
        },
      });
      if (!check1) {
        throw new AppError(
          400,
          "Issue not found or user is not a member of the project",
        );
      }

      const insertComment = await manager.create(Comments, {
        comment: comment,
        issue_id: {
          issue_id: issueId,
        },
        created: {
          id: userId,
        },
      });

      await manager.save(Comments, insertComment);
    });
    return {
      commentCreated: true,
      message: "Comment created successfully",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Something went wrong at Comments");
  }
}
export async function editCommentService(
  commentId: string,
  userId: string,
  comment: string,
) {
  try {
    const query = await AppDataSource.transaction(async (manager) => {
      const checkComment = await manager.findOne(Comments, {
        where: {
          comment_id: commentId,
          created: {
            id: userId,
          },
        },
      });
      if (!checkComment) {
        throw new AppError(
          403,
          "Comment not found or you are not allowed to edit it",
        );
      }
      const updateComment = await manager.update(
        Comments,
        {
          comment_id: commentId,
          created: {
            id: userId,
          },
        },
        {
          comment: comment,
        },
      );

      if (updateComment.affected === 0) {
        throw new AppError(
          403,
          "Comment not found or you are not allowed to edit it",
        );
      }
      return{
        updatedComment:true,
        message:"Comment updated successfully"
      }
    });
    return query;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Something went wrong at editing comment");
  }
}
export async function deleteCommentService(
  commentId: string,
  userId: string,
) {
  try {
    const query = await AppDataSource.transaction(async (manager) => {
      const checkComment = await manager.findOne(Comments, {
        where: {
          comment_id: commentId,
          created: {
            id: userId,
          },
        },
      });

      if (!checkComment) {
        throw new AppError(
          403,
          "Comment not found or you are not allowed to delete it",
        );
      }

      const deleteComment = await manager.delete(Comments, {
        comment_id: commentId,
        created: {
          id: userId,
        },
      });

      if (deleteComment.affected === 0) {
        throw new AppError(
          403,
          "Comment not found or you are not allowed to delete it",
        );
      }

      return {
        deletedComment: true,
        message: "Comment deleted successfully",
      };
    });

    return query;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Something went wrong at deleting comment");
  }
}