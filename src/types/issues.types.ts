import { IssuePriority, IssueStatus } from "../config/entities/Issues.ts";


export type issueCreatetype = {
  projectId: string;
  title: string;
  description: string;
  issueType: string;
  priority: IssuePriority;
  assigneeId: string;
  dueDate: Date;
  issueStatus:IssueStatus
};
