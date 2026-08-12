import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Users } from "./Users.ts";
import { ProjectMembers } from "./ProjectMembers.ts";

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

@Entity("projects")
export class Projects {
  @PrimaryGeneratedColumn("uuid")
  project_id!: string;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
  })
  project_name!: string;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
  })
  project_key!: string;

  @Column({
    type: "varchar",
    length: 500,
  })
  project_description!: string;

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  project_status!: string;

  @ManyToOne(() => Users, (user) => user.projects, {
    nullable: false,
  })
  @JoinColumn({ name: "created_by" })
  created_by!: Users;

  @Column({
    type: "int",
    default: 0,
  })
  next_issue_number!: number;

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

  //bidirectional
  @OneToMany(() => ProjectMembers, (member) => member.project)
  members!: ProjectMembers[];
}
