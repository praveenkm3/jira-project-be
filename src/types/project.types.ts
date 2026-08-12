import { ProjectStatus } from "../config/entities/Projects.ts";


export interface createProjectType {
  project_name: string;
  project_key: string;
  project_description: string;
  project_status: string;
  created_by: string;
}
export type projectDetails = {
  project_id: string;
  project_name: string;
  project_key: string;
  project_description: string;
  project_status:ProjectStatus;
  next_issue_number: number;
  createdAt: string;
  updatedAt:string;
};
export type singleProject = {
  project_members_id: string;
  project: projectDetails;
  createdAt:string
};


