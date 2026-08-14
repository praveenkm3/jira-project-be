import { Router } from "express";
import {
  createIssue,
  getIssues,
  editIssue,
  changeIssueStatus,
  getProjectIssues,
  getProjectMembers
} from "../controllers/issues.controller.ts";

const issueRouter = Router();

issueRouter.post("/:pid", createIssue);
issueRouter.get("/", getIssues);
issueRouter.get("/:pid", getProjectIssues);
issueRouter.get("/:pid/members", getProjectMembers);
issueRouter.put("/:issueId", editIssue);
issueRouter.patch("/:issueId/change-status", changeIssueStatus);

export default issueRouter;
