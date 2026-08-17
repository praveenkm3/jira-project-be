import { AppError } from "../middlewares/errorMiddleware.ts";
import { issueRepo } from "../config/repos.ts";
import { MoreThanOrEqual } from "typeorm";

export const progressCountServices = async (userId: string) => {
  try {
    const query1 = await issueRepo.count({
      where: {
        assignee: {
          id: userId,
        },
        issue_status: "Done",
      },
    });
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
      completed: query1,
      updated: query2,
      created: query3,
      dues_count: query4,
    };
  } catch (error) {
    throw new AppError(500, "Failed to fetch progress counts");
  }
};

export const statusCountServices = async (
  userId: string,
  role: string
) => {
  try {
    const queryBuilder = issueRepo
      .createQueryBuilder("issue")
      .select("issue.issue_status", "status")
      .addSelect("COUNT(issue.issue_id)", "count");

    if (role === "admin") {
      queryBuilder
        .innerJoin("issue.project", "project")
        .innerJoin("project.members", "member")
        .where("member.member_id = :userId", { userId });
    } else {
      queryBuilder
        .innerJoin("issue.assignee", "assignee")
        .where("assignee.id = :userId", { userId });
    }

    return await queryBuilder
      .groupBy("issue.issue_status")
      .getRawMany();
  } catch (error) {
    throw new AppError(500, "Failed to fetch status counts");
  }
};
export const priorityCountServices = async (
  userId: string,
  role: string
) => {
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

    return await queryBuilder
      .groupBy("issue.issue_priority")
      .getRawMany();
  } catch (error) {
    throw new AppError(500, "Failed to fetch priority counts");
  }
};
export const typeCountServices = async (
  userId: string,
  role: string
) => {
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

    return await queryBuilder
      .groupBy("issue.issue_type")
      .getRawMany();
  } catch (error) {
    throw new AppError(500, "Failed to fetch type counts");
  }
};
