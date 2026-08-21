import { IssuePriority } from "../config/entities/Issues.ts";

export type issueCreatetype = {
  projectId: string;
  title: string;
  description: string;
  type: string;
  priority: IssuePriority;
  assignee_id: string;
  due_date: Date;
  start_date?: Date;
  status_id: string;
};

export type notifyType = {
  notification_id: string;
  is_read: boolean;
  message: string;
  createdAt: string;
};
type Issue = {
  issue_id: string;
  issue_number: number;
  issue_title: string;
  issue_description: string;
  issue_type: string;
  issue_priority: string;
  issue_due_date: string;
  assignee_id: string;
  assignee_email: string;
  project_id: string;
  project_name: string;
  reporter_id: string;
  reporter_email: string;
  status_name: string;
  status_id: string;
};

export type IssuesByProject = {
  [projectName: string]: Issue[];
};
