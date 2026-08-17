import { AppDataSource } from "../config/db.ts";
import type { issueCreatetype } from "../types/issues.types.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { issueRepo, projectRepo } from "../config/repos.ts";
import { ProjectMembers } from "../config/entities/ProjectMembers.ts";
import { Issues } from "../config/entities/Issues.ts";
import { Projects } from "../config/entities/Projects.ts";
import { Notifications } from "../config/entities/Notifications.ts";
import { Users } from "../config/entities/Users.ts";
import { ILike } from "typeorm";

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
      status,
    } = data;
    if (
      !projectId ||
      !title ||
      !type ||
      !assignee_id ||
      !priority ||
      !status ||
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
        issue_status: status,
        issue_priority: priority,
        issue_type: type,
        issue_title: title,
        issue_due_date: due_date,
        issue_description: description,
        issue_number: issueNumber,
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
      status,
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

      const updates: Partial<Issues> = {};
      if (title !== undefined) updates.issue_title = title;
      if (description !== undefined) updates.issue_description = description;
      if (type !== undefined) updates.issue_type = type as string;
      if (priority !== undefined) updates.issue_priority = priority;
      if (status !== undefined) updates.issue_status = status as string;
      if (due_date !== undefined) updates.issue_due_date = due_date as Date;
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
    const result = await issueRepo.find({
      select: {
        reporter: {
          id: true,
          email: true,
        },
        assignee: {
          id: true,
          email: true,
        },
        project: {
          project_id: true,
          project_name: true,
        },
      },
      where: {
        assignee: {
          id: userId,
        },
        ...(searchValue
          ? {
              issue_title: ILike(`%${searchValue}%`),
            }
          : {}),
      },
      relations: {
        reporter: true,
        assignee: true,
        project: true,
      },
    });

    const grouped = {
      'Open': [] as typeof result,
      "In Progress": [] as typeof result,
      'Done': [] as typeof result,
    };
    for (const issue of result) {
      if (issue.issue_status in grouped) {
        grouped[issue.issue_status as keyof typeof grouped].push(issue);
      }
    }

    return grouped;
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
          issue_status: statusValue,
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
export async function getProjectIssueService(projectId: string) {
  try {
    const result = await issueRepo.find({
      where: {
        project: {
          project_id: projectId,
        },
      },
      relations: {
        reporter: true,
        assignee: true,
      },
      select: {
        issue_id: true,
        issue_number: true,
        issue_title: true,
        issue_description: true,
        issue_type: true,
        issue_priority: true,
        issue_status: true,
        issue_due_date: true,
        createdAt: true,
        updatedAt: true,

        reporter: {
          id: true,
          email: true,
        },

        assignee: {
          id: true,
          email: true,
        },
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
}
export async function getProjectMembersService(
  projectId: string,
  userId: string,
) {
  return projectRepo
    .createQueryBuilder("project")
    .innerJoin("project.members", "members")
    .innerJoin("members.user", "user")
    .where("project.project_id = :pid", { pid: projectId })
    .andWhere("user.role != :role", { role: "admin" })
    .andWhere("user.id != :userId", { userId })
    .select(["user.id AS id", "user.name AS name", "user.email AS email"])
    .getRawMany();
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
      const isAdmin = user.role === "admin";
      const isReporter = reporterId === userId;

      if (!isAdmin && !isReporter) {
        throw new AppError(
          403,
          "Only the issue creator or an administrator can delete this issue",
        );
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
      issue_status: issue.issue_status,
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
