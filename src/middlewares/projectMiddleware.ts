import type { Request, Response, NextFunction } from "express";
import { projectRepo } from "../config/repos.ts";
import { AppError } from "./errorMiddleware.ts";
export async function checkProjectAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user;

  if (!user) {
    throw new AppError(401, "Unauthorized");
  }

  if (user.role !== "admin") {
    throw new AppError(
      403,
      "Developers are not allowed to modify project",
    );
  }

  const { pid } = req.params;

  const project = await projectRepo
  .createQueryBuilder("project")
  .innerJoin("project.members", "member")
  .innerJoin("member.user", "memberUser")
  .innerJoin("memberUser.role", "role")
  .where("project.project_id = :pid", { pid })
  .andWhere("memberUser.id = :userId", { userId: user.id })
  .andWhere("role.role_name = :role", { role: "admin" })
  .getOne();

  if (!project) {
    throw new AppError(
      404,
      "Project not found, or you are not an admin of this project",
    );
  }

  next();
}
