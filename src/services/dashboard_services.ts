import { AppError } from "../middlewares/errorMiddleware.ts";
import { issueRepo } from "../config/repos.ts";
import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/db.ts";
import { ProjectStatuses } from "../config/entities/ProjectStatuses.ts";

export const progressCountServices = async (userId: string) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const query2 = await issueRepo.count({
      where: [
        {
          updatedAt: MoreThanOrEqual(sevenDaysAgo),
          assignee: {
            id: userId,
          },
        },
      ],
    });
    const query3 = await issueRepo.count({
      where: {
        reporter: {
          id: userId,
        },
      },
    });
    const query4 = await issueRepo.count({
      where: {
        assignee: {
          id: userId,
        },
        issue_due_date: MoreThanOrEqual(new Date()),
      },
    });
    return {
      updated: query2,
      created: query3,
      dues_count: query4,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      500,
      "DB Error ,Something went wrong at fetching progress counts",
    );
  }
};

export const statusCountServices = async (userId: string, role: string) => {
  try {
    const queryBuilder = AppDataSource.getRepository(ProjectStatuses)
      .createQueryBuilder("status")
      .innerJoin("status.project", "project")
      .innerJoin("project.members", "member")
      .leftJoin("Issues", "issue", "issue.status_id = status.status_id")
      .select("status.status_id", "status_id")
      .addSelect("status.status_name", "status_name")
      .addSelect("COUNT(DISTINCT issue.issue_id)", "count");
    if (role === "admin") {
      queryBuilder.where("member.member_id = :userId", { userId });
    } else {
      queryBuilder.andWhere("issue.assignee_id = :userId", { userId });
    }

    return await queryBuilder
      .groupBy("status.status_id")
      .addGroupBy("status.status_name")
      .having("COUNT(DISTINCT issue.issue_id) > 0")
      .getRawMany();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Failed to fetch status counts");
  }
};

export const priorityCountServices = async (userId: string, role: string) => {
  try {
    const queryBuilder = issueRepo
      .createQueryBuilder("issue")
      .select("issue.issue_priority", "priority")
      .addSelect("COUNT(issue.issue_id)", "count");

    if (role === "admin") {
      queryBuilder
        .innerJoin("issue.project", "project")
        .innerJoin("project.members", "member")
        .where("member.member_id = :userId", { userId });
    } else {
      queryBuilder
        .leftJoin("issue.assignee", "assignee")
        .where("assignee.id = :userId", { userId });
    }

    return await queryBuilder.groupBy("issue.issue_priority").getRawMany();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Failed to fetch priority counts");
  }
};
export const typeCountServices = async (userId: string, role: string) => {
  try {
    const queryBuilder = issueRepo
      .createQueryBuilder("issue")
      .select("issue.issue_type", "type")
      .addSelect("COUNT(issue.issue_id)", "count");

    if (role === "admin") {
      queryBuilder
        .innerJoin("issue.project", "project")
        .innerJoin("project.members", "member")
        .where("member.member_id = :userId", { userId });
    } else {
      queryBuilder
        .leftJoin("issue.assignee", "assignee")
        .where("assignee.id = :userId", { userId });
    }

    return await queryBuilder.groupBy("issue.issue_type").getRawMany();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Failed to fetch type counts");
  }
};
