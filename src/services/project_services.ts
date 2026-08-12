import type { createProjectType, singleProject } from "../types/project.types.ts";
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

  const result = await AppDataSource.transaction(async (manager) => {
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
    .andWhere("created_by = :userId", { userId })
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
    .andWhere("created_by = :userId", { userId })
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
  role:string
) => {
  try {
    let result:Projects[] | ProjectMembers[] | null =null;
    if(role==='admin'){
      await projectRepo
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
      ])
      .where("project.project_id = :projectId", { projectId })
      .andWhere("creator.id = :userId", { userId })
      .getOne();
    } else if(role==='developer'){
      result=await projectMemberRepo
      .createQueryBuilder('projectMember')
      .innerJoinAndSelect("projectMember.project","project")
      // .innerJoinAndSelect("project.created_by","creator")
      .where("projectMember.user = :id",{id:userId})
      .andWhere("project.project_id = :pid",{pid:projectId})
      .getMany();
    }
    return result;
  } catch (error) {
    throw error;
  }
};
export const allProjectsService = async (userId: string, role: string) => {
  try {
    let result :Projects[] | ProjectMembers[] | null=null;
    if (role === "admin") {
      result = await projectRepo
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
        ])
        .where("creator.id = :userId", { userId })
        .getMany();
    }else if(role==='developer'){
      result=await projectMemberRepo
      .createQueryBuilder('projectMember')
      .innerJoinAndSelect("projectMember.project","project")
      .where("projectMember.user = :id",{id:userId})
      .getMany();
    }
    return result;
  } catch (error) {
    throw error;
  }
};
