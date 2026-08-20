import type {
  createProjectType, 
} from "../types/project.types.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { Projects } from "../config/entities/Projects.ts";
import {
  projectMemberRepo,
  projectRepo,
  statusRepository,
} from "../config/repos.ts";
import type { QueryDeepPartialEntity } from "typeorm";
import { AppDataSource } from "../config/db.ts";
import { ProjectMembers } from "../config/entities/ProjectMembers.ts";
import { ProjectStatuses } from "../config/entities/ProjectStatuses.ts";
import { error } from "node:console";

export const createProjectService = async (
  data: createProjectType,
  userId: string,
) => {
  const { project_name, project_key, project_description, project_status } =
    data;
  let result;
  try {
    result = await AppDataSource.transaction(async (manager) => {
      const project = manager.create(Projects, {
        project_name,
        project_key,
        project_description,
        project_status,
        created_by: {
          id: userId,
        },
      });

      await manager.save(Projects, project);

      const projectMember = manager.create(ProjectMembers, {
        project: {
          project_id: project.project_id,
        },
        user: {
          id: userId,
        },
      });

      await manager.save(ProjectMembers, projectMember);

      return {
        created: true,
        message: "Project created successfully",
      };
    });
  } catch (error) {
    throw new AppError(400, "Error while creating Project");
  }
  return result;
};
export const deleteProjectService = async (
  userId: string,
  projectId: string,
) => {
  const result = await projectRepo
    .createQueryBuilder()
    .delete()
    .from(Projects)
    .where("project_id = :projectId", { projectId })
    .execute();

  if (result.affected === 0) {
    throw new AppError(
      404,
      "Project not found or you are not allowed to delete it",
    );
  }
  return {
    deleted: true,
    message: "Project deleted successfully",
  };
};
export const editProjectService = async (
  data: Partial<createProjectType>,
  userId: string,
  projectId: string,
) => {
  const updateFields: QueryDeepPartialEntity<Projects> = {};

  if (data.project_name !== undefined) {
    updateFields.project_name = data.project_name;
  }

  if (data.project_key !== undefined) {
    updateFields.project_key = data.project_key;
  }

  if (data.project_description !== undefined) {
    updateFields.project_description = data.project_description;
  }

  if (data.project_status !== undefined) {
    updateFields.project_status = data.project_status;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new AppError(400, "No fields provided for update");
  }

  const result = await projectRepo
    .createQueryBuilder()
    .update(Projects)
    .set(updateFields)
    .where("project_id = :projectId", { projectId })
    .execute();

  if (result.affected === 0) {
    return {
      updated: false,
      message: "Nothing To Update",
    };
  }

  return {
    updated: true,
    message: "Project updated successfully",
  };
};
export const specificProjectService = async (
  userId: string,
  projectId: string,
  role: string,
) => {
  try {
    const query = projectRepo
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.created_by", "creator")
      .leftJoinAndSelect("creator.role", "creatorRole")
      .leftJoinAndSelect("project.members", "member")
      .leftJoinAndSelect("member.user", "memberUser")
      .leftJoinAndSelect("memberUser.role", "memberRole")
      .select([
        "project.project_id",
        "project.project_name",
        "project.project_key",
        "project.project_status",
        "project.project_description",

        "creator.id",
        "creator.name",
        "creator.email",
        "creatorRole.role_name",

        "member.project_members_id",

        "memberUser.id",
        "memberUser.name",
        "memberUser.email",
        "memberRole.role_name",
      ])
      .where("project.project_id = :projectId", {
        projectId,
      });

    if (role === "admin") {
      query.andWhere(`(creator.id = :userId OR memberUser.id = :userId)`, {
        userId,
      });
    } else {
      query.andWhere("memberUser.id = :userId", {
        userId,
      });
    }

    return await query.getOne();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      500,
      "DB Error, Something went wrong at get project details",
    );
  }
};
export const allProjectsService = async (userId: string, role: string) => {
  try {
    const query = projectRepo
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.created_by", "creator")
      .leftJoinAndSelect("project.members", "member")
      .leftJoinAndSelect("member.user", "memberUser")
      .leftJoinAndSelect("memberUser.role", "role")
      .select([
        "project.project_id",
        "project.project_name",
        "project.project_key",
        "project.project_status",

        "creator.id",
        "creator.name",
        "creator.email",
        "creator.role",

        "member.project_members_id",

        "memberUser.id",
        "memberUser.name",
        "memberUser.email",

        "role.role_name",
      ]);

    const memberSubQuery = query
      .subQuery()
      .select("pm.project_id")
      .from(ProjectMembers, "pm")
      .where("pm.member_id = :userId")
      .getQuery();

    if (role === "admin") {
      query.where(
        `(memberUser.id = :userId OR project.project_id IN ${memberSubQuery})`,
        { userId },
      );
    } else {
      query.where(`project.project_id IN ${memberSubQuery}`, {
        userId,
      });
    }

    return await query.getMany();
  } catch (error) {
    throw new AppError(500, "Fetching projects failed");
  }
};
export const myProjectsForSearchService = async (userId: string) => {
  try {
    return await projectRepo
      .createQueryBuilder("project")
      .innerJoin("project.members", "member")
      .select(["project.project_id", "project.project_name"])
      .where("member.member_id = :userId", { userId })
      .orderBy("project.project_name", "ASC")
      .getMany();
  } catch (error) {
    throw new AppError(500, "fetching failed for user projects ");
  }
};
export async function getAllProjectMembersService(
  projectId: string,
) {
  const result = projectRepo
    .createQueryBuilder("project")
    .innerJoin("project.members", "members")
    .innerJoin("members.user", "user")
    .innerJoin("user.role", "role")
    .where("project.project_id = :pid", { pid: projectId })
    .select([
      "user.id AS id",
      "user.name AS name",
      "user.status AS status",
      "user.email AS email",
      "role.role_name AS role",
      "user.createdAt AS joinedAt",
    ])
    .getRawMany();
  return result;
}
export async function specificProjectStatusesService(projectId: string) {
  const result = await statusRepository
    .createQueryBuilder("status")
    .innerJoin("status.project", "project")
    .where("project.project_id = :projectId", { projectId })
    .select([
      "status.status_name AS status_name",
      "status.status_id AS status_id",
    ])
    .getRawMany();

  return result;
}

export async function addStatusesToProjectService(
  projectId: string,
  userId: string,
  status_name: string,
) {
  try {
    const check1 = await projectMemberRepo.findOne({
      where: {
        user: {
          id: userId,
          role: {
            role_name: "admin",
          },
          projects: {
            project_id: projectId,
          },
        },
      },
    });
    if (!check1) {
      return {
        statusAdded: false,
        message:
          "Not allowed to add the issue to project or not admin of the project",
      };
    }
    const result = await statusRepository
      .createQueryBuilder("status")
      .insert()
      .into(ProjectStatuses)
      .values({
        status_name: status_name,
        project: {
          project_id: projectId,
        },
      })
      .execute();
    if (result.identifiers.length > 0) {
      return {
        message: "Status added successfully",
      };
    } else {
      throw error;
    }
  } catch (error) {
    throw new AppError(500, "Status was not added");
  }
}
