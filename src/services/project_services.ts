import type {
  createProjectType,
  singleProject,
} from "../types/project.types.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { Projects } from "../config/entities/Projects.ts";
import { projectMemberRepo, projectRepo } from "../config/repos.ts";
import type { QueryDeepPartialEntity } from "typeorm";
import { AppDataSource } from "../config/db.ts";
import { ProjectMembers } from "../config/entities/ProjectMembers.ts";

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
    // .andWhere("created_by = :userId", { userId })
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
      .leftJoinAndSelect("project.members", "member")
      .leftJoinAndSelect("member.user", "memberUser")
      .select([
        "project.project_id",
        "project.project_name",
        "project.project_key",
        "project.project_status",
        "project.project_description",

        "creator.id",
        "creator.name",
        "creator.email",
        "creator.role",

        "member.project_members_id",

        "memberUser.id",
        "memberUser.name",
        "memberUser.email",
        "memberUser.role",
      ])
      .where("project.project_id = :projectId", {
        projectId,
      });

    if (role === "admin") {
      query.andWhere(
        `(creator.id = :userId OR memberUser.id = :userId)`,
        {
          userId,
        },
      );
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
        "memberUser.role",
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
        { userId }
      );
    } else {
      query.where(
        `project.project_id IN ${memberSubQuery}`,
        { userId }
      );
    }

    return await query.getMany();
  } catch (error) {
    throw new AppError(500,"Fetching projects failed");
  }
};
export const myProjectsForSearchService = async (userId: string)=>{
 try {
    return await projectRepo
      .createQueryBuilder("project")
      .innerJoin("project.members", "member")
      .select([
        "project.project_id",
        "project.project_name",
      ])
      .where("member.member_id = :userId", { userId })
      .orderBy("project.project_name", "ASC")
      .getMany();
  } catch (error) {
    throw new AppError(500,"fetching failed for user projects ");
  }
}