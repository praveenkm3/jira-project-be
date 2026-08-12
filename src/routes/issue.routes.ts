import { Router } from "express";
import { createIssue,getIssues,editIssue,changeIssueStatus } from "../controllers/issues.controller.ts";



const issueRouter = Router();



issueRouter.post("/", createIssue);
issueRouter.get("/", getIssues);
issueRouter.put("/:issueId", editIssue);
issueRouter.patch("/:issueId/change-status", changeIssueStatus);

export default issueRouter;
