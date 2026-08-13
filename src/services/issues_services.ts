import { AppDataSource } from "../config/db.ts";
import type { issueCreatetype } from "../types/issues.types.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { issueRepo } from "../config/repos.ts";
import { ProjectMembers } from "../config/entities/ProjectMembers.ts";
import { Issues } from "../config/entities/Issues.ts";
import { Projects } from "../config/entities/Projects.ts";
import { Notifications } from "../config/entities/Notifications.ts";
import { Users } from "../config/entities/Users.ts";
export type issueUpdateType = Partial<issueCreatetype>;

export async function createIssueService(
  data: issueCreatetype,
  userId: string,
) {
  try {
    const {
      projectId,
      title,
      description,
      issueType,
      priority,
      assigneeId,
      dueDate,
      issueStatus,
    } = data;
    if (
      !projectId ||
      !title ||
      !issueType ||
      !assigneeId ||
      !priority ||
      !issueStatus
    ) {
      throw new AppError(400, "Issue details required");
    }
    if (userId === assigneeId) {
      throw new AppError(400, "Reporter and assignee cannot be the same user");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
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
          id: assigneeId,
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
          id: assigneeId,
        },
        reporter: {
          id: userId,
        },
        issue_status: issueStatus,
        issue_priority: priority,
        issue_type: issueType,
        issue_title: title,
        issue_due_date: dueDate,
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
          id: assigneeId,
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
      issueType,
      priority,
      assigneeId,
      dueDate,
      issueStatus,
    } = data;

    if (assigneeId && userId === assigneeId) {
      throw new AppError(400, "Reporter and assignee cannot be the same user");
    }

    if (dueDate !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
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

      if (assigneeId) {
        const check1 = await manager.existsBy(ProjectMembers, {
          project: { project_id: projectId },
          user: { id: assigneeId },
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
      if (issueType !== undefined) updates.issue_type = issueType;
      if (priority !== undefined) updates.issue_priority = priority;
      if (issueStatus !== undefined) updates.issue_status = issueStatus;
      if (dueDate !== undefined) updates.issue_due_date = dueDate;
      if (assigneeId !== undefined) {
        updates.assignee = { id: assigneeId } as Users;
      }

      if (Object.keys(updates).length === 0) {
        throw new AppError(400, "No fields provided to update");
      }

      manager.merge(Issues, issue, updates);
      await manager.save(Issues, issue);

      const assigneeChanged =
        assigneeId && previousAssigneeId && previousAssigneeId !== assigneeId;

      if (assigneeChanged) {
        const notificationCreation = manager.create(Notifications, {
          created_by: { id: userId },
          reciever: { id: assigneeId },
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
export async function getIssueService(userId: string) {
  try {
    const result = await issueRepo.find({
      select: {
        reporter: {
          id: true,
          email: true,
        },
      },
      where: {
        assignee: {
          id: userId,
        },
      },
      relations: {
        reporter: true,
      },
    });
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
          issue_status: statusValue,
        },
      );
      if (updateIssue.affected === 0) {
        throw new AppError(404, "Issue not found");
      }
      return ({
        statusChanged:true,
        message:"Status changed Successfully"
      })
    });
    return query;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DB Error ,Something went wrong at change Issue status");
  }
}
