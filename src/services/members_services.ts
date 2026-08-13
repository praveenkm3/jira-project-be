import type { insertedDataType } from "../types/members.types.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { projectMemberRepo } from "../config/repos.ts";
import { ProjectMembers } from "../config/entities/ProjectMembers.ts";
import { AppDataSource } from "../config/db.ts";
import { Not } from "typeorm";
import { Issues } from "../config/entities/Issues.ts";

export async function addMembersToProjectService(
  data: string[],
  project_id: string,
) {
  try {
    const insertedData: insertedDataType[] = data.map((member) => ({
      project: {
        project_id,
      },
      user: {
        id: member,
      },
    }));
    const query = await projectMemberRepo
      .createQueryBuilder()
      .insert()
      .into(ProjectMembers)
      .values(insertedData)
      .orIgnore()
      .execute();
    if (query?.raw?.length > 0) {
      return {
        inserted: true,
        message: "Developers Added Into Project",
      };
    }
    return {
      inserted: false,
      message: "Developers Not Added Into Project, or already added",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Something went wrong");
  }
}
export async function deleteMembersFromProjectService(
  pid: string,
  userId: string,
) {
  try {
    const result = await projectMemberRepo
      .createQueryBuilder()
      .delete()
      .from(ProjectMembers)
      .where("project_id = :pid", { pid })
      .andWhere("member_id = :userId", { userId })
      .execute();

    if (result.affected === 0) {
      throw new AppError(404, "Member or Project not found to delete it");
    }
    return {
      deleted: true,
      message: "Member deleted from project",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Something went wrong");
  }
}
export async function editProjectMembersService(
  data: string[],
  projectId: string,
  userId: string,
) {
  const query = await AppDataSource.transaction(async (manager) => {
    const currentMembers = await manager.find(ProjectMembers, {
      where: {
        project: {
          project_id: projectId,
        },
        user: {
          id: Not(userId),
        },
      },
      relations: {
        user: true,
      },
      select: {
        user: {
          id: true,
        },
      },
    });

    const currentUserIds = currentMembers.map((member) => member.user.id);

    const newUserIds = data;
    const usersToRemove = currentUserIds.filter(
      (id) => !newUserIds.includes(id),
    );

    const usersToAdd = newUserIds.filter((id) => !currentUserIds.includes(id));

    if (usersToRemove.length > 0) {
      await manager
        .createQueryBuilder()
        .update(Issues)
        .set({ assignee: null })
        .where("project_id = :projectId", { projectId })
        .andWhere("assignee_id IN (:...userIds)", { userIds: usersToRemove })
        .execute();
      await manager
        .createQueryBuilder()
        .delete()
        .from(ProjectMembers)
        .where("project_id = :projectId", { projectId })
        .andWhere("member_id IN (:...userIds)", {
          userIds: usersToRemove,
        })
        .execute();
    }

    if (usersToAdd.length > 0) {
      const members = usersToAdd.map((userId) => ({
        project: {
          project_id: projectId,
        },
        user: {
          id: userId,
        },
      }));

      await manager
        .createQueryBuilder()
        .insert()
        .into(ProjectMembers)
        .values(members)
        .execute();
    }

    return {
      updated: true,
      message: "Project members updated successfully",
    };
  });
  return query;
}
