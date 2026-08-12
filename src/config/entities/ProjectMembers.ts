import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Projects } from "./Projects.ts";
import { Users } from "./Users.ts";


@Unique("project_member",["project", "user"])
@Entity("project_members")
export class ProjectMembers {
  @PrimaryGeneratedColumn("uuid")
  project_members_id!: string;

  @ManyToOne(() => Projects, (project) => project.members, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project!: Projects;

  @ManyToOne(() => Users, (user) => user.projectMembers, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "member_id" })
  user!: Users;

  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
  })
  createdAt!: Date;
}
