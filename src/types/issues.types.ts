import { IssuePriority, IssueStatus } from "../config/entities/Issues.ts";


export type issueCreatetype = {
  projectId: string;
  title: string;
  description: string;
  type: string;
  priority: IssuePriority;
  assignee_id: string;
  due_date: Date;
  status:IssueStatus
};

export type notifyType={
  notification_id:string,
  is_read:boolean,
  message:string,
  createdAt:string

}