import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Projects } from "./Projects.ts";
import { Users } from "./Users.ts";
import { ProjectStatuses } from "./ProjectStatuses.ts";

export enum IssuePriority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}
export enum IssueType {
  BUG = "Bug",
  TASK = "Task",
  FEATURE = "Feature",
}
@Entity("issues")
export class Issues {
  @PrimaryGeneratedColumn("uuid")
  issue_id!: string;

  @ManyToOne(() => Projects, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project!: Projects;

  @Column({
    type: "int",
  })
  issue_number!: number;

  @Column({
    type: "varchar",
    length: 200,
    unique: true,
  })
  issue_title!: string;

  @Column({
    type: "text",
  })
  issue_description!: string;

  @Column({
    type: "enum",
    enum: IssueType,
    nullable: true,
  })
  issue_type!: string;

  @Column({
    type: "enum",
    enum: IssuePriority,
    default: IssuePriority.MEDIUM,
  })
  issue_priority!: string;

  // @Column({
  //   type: "enum",
  //   enum: IssueStatus,
  //   nullable: false,
  // })
  // issue_status!: string;

  @ManyToOne(() => ProjectStatuses, {
    nullable: true,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "status_id" })
  issue_status!: ProjectStatuses;

  @ManyToOne(() => Users, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "assignee_id" })
  assignee!: Users | null;

  @ManyToOne(() => Users, {
    nullable: false,
  })
  @JoinColumn({ name: "reporter_id" })
  reporter!: Users;

  @Column({
    type: "date",
    nullable: true,
  })
  issue_due_date!: Date;

  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    name: "updated_at",
  })
  updatedAt!: Date;
}
