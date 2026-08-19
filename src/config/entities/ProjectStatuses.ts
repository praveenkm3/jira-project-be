import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";

import { Projects } from "./Projects.ts";

@Entity("project_statuses")
@Index(["project", "status_name"], { unique: true })
export class ProjectStatuses {
  @PrimaryGeneratedColumn("uuid")
  status_id!: string;

  @ManyToOne(() => Projects, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project!: Projects;

  @Column({
    type: "varchar",
    length: 100,
  })
  status_name!: string;
}