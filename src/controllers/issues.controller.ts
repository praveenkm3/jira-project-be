import type { Request, Response, NextFunction } from "express";
import {
  deleteIssueService,
  createIssueService,
  getIssueService,
  editIssueService,
  changeIssueStatusService,
  getProjectIssueService,
  getProjectMembersService,
  getIssueByIdService,
} from "../services/issues_services.ts";
import type { issueCreatetype } from "../types/issues.types.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";

export const createIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data: issueCreatetype = req.body;
    const { pid } = req.params;
    const userId = req?.user?.id as string;
    const response = await createIssueService(data, userId, pid as string);
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
export const getIssues = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req?.user?.id as string;
    const { search = "" } = req.params;
    const response = await getIssueService(userId, search as string);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
export const editIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data: issueCreatetype = req.body;
    const userId = req?.user?.id as string;
    const { issueId } = req?.params;
    const response = await editIssueService(issueId as string, data, userId);
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
export const changeIssueStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status: statusValue } = req.body;
    const { issueId } = req?.params;
    const userId = req.user?.id as string;
    if (!issueId) {
      throw new AppError(400, "IssueId not provided");
    }
    if (!statusValue) {
      throw new AppError(400, "statusValue not provided");
    }
    const response = await changeIssueStatusService(
      userId,
      issueId as string,
      statusValue,
    );
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProjectIssues = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { pid } = req.params;
    const { pageNumber, pageRecords, field, value } = req.query;
    const response = await getProjectIssueService(
      pid as string,
      pageNumber as string,
      pageRecords as string,
      field as string,
      value as string,
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProjectMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { pid } = req.params;
    const userId = req.user?.id as string;
    const response = await getProjectMembersService(pid as string, userId);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
export const deleteIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req?.user?.id as string;
    const { issueId } = req?.params;
    const response = await deleteIssueService(issueId as string, userId);
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
export async function getSpecificIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { issueId } = req.params;

    if (!issueId) {
      throw new AppError(400, "Issue ID is required");
    }

    const issue = await getIssueByIdService(issueId as string);

    res.status(200).json(issue);
  } catch (error) {
    next(error);
  }
}
