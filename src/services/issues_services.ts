import { AppDataSource } from "../config/db.ts";
import type {
  issueCreatetype,
  IssuesByProject,
} from "../types/issues.types.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { issueRepo, projectRepo } from "../config/repos.ts";
import { ProjectMembers } from "../config/entities/ProjectMembers.ts";
import { Issues } from "../config/entities/Issues.ts";
import { Projects } from "../config/entities/Projects.ts";
import { Notifications } from "../config/entities/Notifications.ts";
import { Users } from "../config/entities/Users.ts";
import { ILike } from "typeorm";
import type { ProjectStatuses } from "../config/entities/ProjectStatuses.ts";

export type issueUpdateType = Partial<issueCreatetype>;

export async function createIssueService(
  data: issueCreatetype,
  userId: string,
  projectId: string,
) {
  try {
    const {
      title,
      description,
      type,
      priority,
      assignee_id,
      due_date,
      status_id,
      start_date,
    } = data;
    if (
      !projectId ||
      !title ||
      !type ||
      !assignee_id ||
      !priority ||
      !status_id ||
      !due_date
    ) {
      throw new AppError(400, "Issue details required");
    }
    if (userId === assignee_id) {
      throw new AppError(400, "Reporter and assignee cannot be the same user");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(due_date);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      throw new Error("Due date cannot be in the past");
    }
    let start: Date | null = null;

    if (start_date) {
      start = new Date(start_date);
      start.setHours(0, 0, 0, 0);

      if (start < today) {
        throw new AppError(400, "Start date cannot be in the past");
      }

      if (start > due) {
        throw new AppError(400, "Start date cannot be after due date");
      }
    }
    const result = await AppDataSource.transaction(async (manager) => {
      const check1 = await manager.existsBy(ProjectMembers, {
        project: {
          project_id: projectId,
        },
        user: {
          id: userId,
        },
      });
      if (!check1) {
        throw new AppError(
          404,
          "Project not found or not allowed to add issues",
        );
      }
      const check2 = await manager.existsBy(ProjectMembers, {
        project: {
          project_id: projectId,
        },
        user: {
          id: assignee_id,
        },
      });
      if (!check2) {
        throw new AppError(404, "Assignee not belongs to this project");
      }
      const project = await manager
        .getRepository(Projects)
        .createQueryBuilder("project")
        .setLock("pessimistic_write")
        .where("project.project_id = :projectId", { projectId })
        .getOne();
      if (!project) {
        return {
          issueCreated: false,
          message: "Project not found",
        };
      }
      const issueNumber = project.next_issue_number + 1;
      const issueCreation = await manager.create(Issues, {
        project: {
          project_id: projectId,
        },
        assignee: {
          id: assignee_id,
        },
        reporter: {
          id: userId,
        },
        issue_status: {
          status_id: status_id,
        },
        issue_priority: priority,
        issue_type: type,
        issue_title: title,
        issue_due_date: due_date,
        issue_description: description,
        issue_number: issueNumber,
        issue_start_date: start,
      });
      project.next_issue_number = issueNumber;
      await manager.save(Issues, issueCreation);
      await manager.save(Projects, project);
      //create notifications
      const notificationCreation = await manager.create(Notifications, {
        created_by: {
          id: userId,
        },
        reciever: {
          id: assignee_id,
        },
        issuse_id: {
          issue_id: issueCreation.issue_id,
        },
        is_read: false,
        message: `You have been assigned to ticket, ${title}`,
      });
      await manager.save(Notifications, notificationCreation);
      return {
        issueCreated: true,
        message: "Issue created successfully",
      };
    });
    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Something went wrong at Issues");
  }
}
export async function editIssueService(
  issueId: string,
  data: issueUpdateType,
  userId: string,
) {
  try {
    const {
      title,
      description,
      type,
      priority,
      assignee_id,
      due_date,
      status_id,
      start_date,
    } = data;

    if (assignee_id && userId === assignee_id) {
      throw new AppError(400, "Reporter and assignee cannot be the same user");
    }

    if (due_date !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(due_date);
      due.setHours(0, 0, 0, 0);
      if (due < today) {
        throw new AppError(400, "Due date cannot be in the past");
      }
    }
    const result = await AppDataSource.transaction(async (manager) => {
      const lockedIssue = await manager
        .getRepository(Issues)
        .createQueryBuilder("issue")
        .setLock("pessimistic_write")
        .where("issue.issue_id = :issueId", { issueId })
        .getOne();

      if (!lockedIssue) {
        throw new AppError(404, "Issue not found");
      }

      const issue = await manager.findOne(Issues, {
        where: { issue_id: issueId },
        relations: { project: true, assignee: true },
      });

      if (!issue) {
        throw new AppError(404, "Issue not found");
      }

      const projectId = issue.project.project_id;
      const previousAssigneeId = issue.assignee?.id;

      if (assignee_id) {
        const check1 = await manager.existsBy(ProjectMembers, {
          project: { project_id: projectId },
          user: { id: assignee_id },
        });
        if (!check1) {
          throw new AppError(400, "Assignee does not belong to this project");
        }
      }

      const check2 = await manager.existsBy(ProjectMembers, {
        project: { project_id: projectId },
        user: { id: userId },
      });
      if (!check2) {
        throw new AppError(403, "You are not a member of this project");
      }
      const currentStartDate = issue.issue_start_date;
      const currentDueDate = issue.issue_due_date;
      const finalStartDate =
        start_date !== undefined
          ? start_date
            ? new Date(start_date)
            : null
          : currentStartDate;
      const finalDueDate =
        due_date !== undefined
          ? due_date
            ? new Date(due_date)
            : null
          : currentDueDate;
          const today = new Date();
      today.setHours(0, 0, 0, 0);
 
      if (finalStartDate) {
        finalStartDate.setHours(0, 0, 0, 0);

        if (finalStartDate < today) {
          throw new AppError(
            400,
            "Start date cannot be in the past",
          );
        }
      }
      if (finalDueDate) {
        finalDueDate.setHours(0, 0, 0, 0);

        if (finalDueDate < today) {
          throw new AppError(
            400,
            "Due date cannot be in the past",
          );
        }
      }
      if (
        finalStartDate &&
        finalDueDate &&
        finalStartDate > finalDueDate
      ) {
        throw new AppError(
          400,
          "Start date cannot be after due date",
        );
      }
      const updates: Partial<Issues> = {};
      if (title !== undefined) updates.issue_title = title;
      if (description !== undefined) updates.issue_description = description;
      if (type !== undefined) updates.issue_type = type as string;
      if (priority !== undefined) updates.issue_priority = priority;
      if (status_id !== undefined) {
        updates.issue_status = {
          status_id: status_id,
        } as ProjectStatuses;
      }
      if (due_date !== undefined) updates.issue_due_date = due_date as Date;
      if (start_date !== undefined) updates.issue_start_date= start_date as Date;
      if (assignee_id !== undefined) {
        updates.assignee = { id: assignee_id } as Users;
      }

      if (Object.keys(updates).length === 0) {
        throw new AppError(400, "No fields provided to update");
      }

      manager.merge(Issues, issue, updates);
      await manager.save(Issues, issue);

      const assigneeChanged =
        assignee_id && previousAssigneeId && previousAssigneeId !== assignee_id;

      if (assigneeChanged) {
        const notificationCreation = manager.create(Notifications, {
          created_by: { id: userId },
          reciever: { id: assignee_id },
          issuse_id: { issue_id: issue.issue_id },
          is_read: false,
          message: `You have been assigned to ticket, ${title ?? issue.issue_title}`,
        });
        await manager.save(Notifications, notificationCreation);
      }

      return {
        issueUpdated: true,
        message: "Issue updated successfully",
      };
    });
    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Something went wrong at editing Issue");
  }
}
export async function getIssueService(userId: string, search: string) {
  try {
    const searchValue = search.trim();
    const query = await issueRepo
      .createQueryBuilder("issue")
      .innerJoin("issue.project", "project")
      .innerJoin("issue.reporter", "reporter")
      .innerJoin("issue.assignee", "assignee")
      .innerJoin("issue.issue_status", "status")
      .select([
        "issue.issue_id as issue_id",
        "issue.issue_number as issue_number",
        "issue.issue_title as issue_title",
        "issue.issue_description as issue_description",
        "issue.issue_type as issue_type",
        "issue.issue_priority as issue_priority",
        "issue.issue_due_date as issue_due_date",

        "assignee.id as assignee_id",
        "assignee.email as assignee_email",

        "project.project_id as project_id",
        "project.project_name as project_name",

        "reporter.id as reporter_id",
        "reporter.email as reporter_email",

        "status.status_name as status_name",
        "status.status_id as status_id",
      ])
      .where("assignee.id = :uid", { uid: userId });
    if (searchValue) {
      query.andWhere("issue.issue_title ILIKE :value", {
        value: `%${searchValue}%`,
      });
    }
    const data = await query.getRawMany();
    const result: IssuesByProject = {};

    for (const ele of data) {
      if (ele.project_name in result) {
        (result[ele.project_name] ??= []).push(ele);
      } else {
        result[ele.project_name] = [ele];
      }
    }

    return result;
  } catch (error) {
    throw new AppError(400, "Issue fetching failed");
  }
}
export async function changeIssueStatusService(
  assigneeId: string,
  issueId: string,
  statusValue: string,
) {
  try {
    const query = await AppDataSource.transaction(async (manager) => {
      const check1 = await manager.existsBy(Issues, {
        assignee: {
          id: assigneeId,
        },
        issue_id: issueId,
      });
      if (!check1) {
        throw new AppError(400, "Assignee does not belong to this project");
      }

      const updateIssue = await manager.update(
        Issues,
        {
          issue_id: issueId,
        },
        {
          issue_status: {
            status_id: statusValue,
          },
        },
      );
      if (updateIssue.affected === 0) {
        throw new AppError(404, "Issue not found");
      }
      return {
        statusChanged: true,
        message: "Status changed Successfully",
      };
    });
    return query;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      500,
      "DB Error ,Something went wrong at change Issue status",
    );
  }
}
export async function getProjectIssueService(
  projectId: string,
  pageNumber: number | string = 0,
  recordsPerPage: number | string = 10,
  filterColumn: string | undefined,
  filterValue: string | undefined,
) {
  try {
    const query = await issueRepo
      .createQueryBuilder("issues")
      .innerJoin("issues.project", "project")
      .innerJoin("issues.issue_status", "status")
      .innerJoin("issues.reporter", "reporter")
      .innerJoin("issues.assignee", "assignee")
      .where("project.project_id = :projectId", { projectId });
    if (filterColumn === "issue_number") {
      query.andWhere(`issues.${filterColumn}>= `);
    } else if (filterColumn?.startsWith("assignee")) {
      query.andWhere(`assignee.email ILIKE :value`, {
        value: `%${filterValue}%`,
      });
    } else if (filterColumn?.startsWith("reporter")) {
      query.andWhere(`reporter.email ILIKE :value`, {
        value: `%${filterValue}%`,
      });
    } else if (filterColumn && filterValue) {
      query.andWhere(`issues.${filterColumn} ILIKE :value`, {
        value: `%${filterValue}%`,
      });
    }
    query.select([
      "issues.issue_id",
      "issues.issue_number",
      "issues.issue_title",
      "issues.issue_description",
      "issues.issue_type",
      "issues.issue_priority",
      "issues.issue_type",
      "issues.issue_due_date",
      "issues.issue_start_date",
      "issues.createdAt",
      "issues.updatedAt",

      "status.status_name",
      "status.status_id",

      "reporter.email",
      "reporter.id",
      "reporter.name",

      "assignee.email",
      "assignee.id",
      "assignee.name",
    ]);
    const totalRecords = (await query.getMany()).length;
    query.limit(Number(recordsPerPage));
    const skipRecords =
      Number(pageNumber) <= 0 ? 0 : Number(pageNumber) * Number(recordsPerPage);
    query.offset(skipRecords);
    const result = await query.getMany();
    console.log(totalRecords);
    return { totalRecords: totalRecords, result: result };
  } catch (error) {
    throw error;
  }
}
export async function getProjectMembersService(
  projectId: string,
  userId: string,
) {
  try {
    const result = projectRepo
      .createQueryBuilder("project")
      .innerJoin("project.members", "members")
      .innerJoin("members.user", "user")
      .innerJoin("user.role", "role")
      .where("project.project_id = :pid", { pid: projectId })
      .andWhere("role.role_name != :role", { role: "admin" })
      .andWhere("user.id != :userId", { userId })
      .select([
        "user.id AS id",
        "user.name AS name",
        "user.email AS email",
        "role.role_name AS role",
      ])
      .getRawMany();
    return result;
  } catch (error) {
    throw new AppError(
      500,
      "DB Error, Something went wrong while fetching project members",
    );
  }
}
export async function deleteIssueService(issueId: string, userId: string) {
  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const issue = await manager
        .getRepository(Issues)
        .createQueryBuilder("issue")
        .setLock("pessimistic_write")
        .where("issue.issue_id = :issueId", { issueId })
        .getOne();

      if (!issue) {
        throw new AppError(404, "Issue not found");
      }

      const issueWithRelations = await manager.findOne(Issues, {
        where: {
          issue_id: issueId,
        },
        relations: {
          project: true,
          reporter: true,
        },
      });

      if (!issueWithRelations) {
        throw new AppError(404, "Issue not found");
      }

      const projectId = issueWithRelations.project.project_id;
      const reporterId = issueWithRelations.reporter.id;

      const isProjectMember = await manager.existsBy(ProjectMembers, {
        project: {
          project_id: projectId,
        },
        user: {
          id: userId,
        },
      });

      if (!isProjectMember) {
        throw new AppError(403, "You are not a member of this project");
      }

      const user = await manager.findOne(Users, {
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }
      const isReporter = reporterId === userId;

      if (!isReporter) {
        throw new AppError(403, "Only the issue creator can delete this issue");
      }

      await manager.remove(Issues, issueWithRelations);

      return {
        issueDeleted: true,
        message: "Issue deleted successfully",
      };
    });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      500,
      "DB Error, Something went wrong while deleting issue",
    );
  }
}
export async function getIssueByIdService(issueId: string) {
  try {
    const issue = await AppDataSource.getRepository(Issues).findOne({
      where: {
        issue_id: issueId,
      },
      relations: {
        project: true,
        reporter: true,
        assignee: true,
        issue_status:true
      },
    });

    if (!issue) {
      throw new AppError(404, "Issue not found");
    }

    return {
      issue_id: issue.issue_id,
      issue_number: issue.issue_number,
      issue_title: issue.issue_title,
      issue_description: issue.issue_description,
      issue_type: issue.issue_type,
      issue_priority: issue.issue_priority,
      issue_status: issue.issue_status.status_name,
      issue_due_date: issue.issue_due_date,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,

      project: {
        project_id: issue.project.project_id,
        project_name: issue.project.project_name,
        project_key: issue.project.project_key,
      },

      reporter: {
        id: issue.reporter.id,
        name: issue.reporter.name,
        email: issue.reporter.email,
      },

      assignee: issue.assignee
        ? {
            id: issue.assignee.id,
            name: issue.assignee.name,
            email: issue.assignee.email,
          }
        : null,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      500,
      "DB Error, Something went wrong while fetching issue",
    );
  }
}
