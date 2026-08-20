import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Role } from "./Roles.ts";
import { Projects } from "./Projects.ts";
import { ProjectMembers } from "./ProjectMembers.ts";
import { Designation } from "./Designation.tsx";
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 150,
    unique: true,
  })
  email!: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  password!: string;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
  })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @ManyToOne(() => Designation, (designation) => designation.users, {
    nullable: true,
  })
  @JoinColumn({ name: "designation_id" })
  designation?: Designation;

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

  @OneToMany(() => Projects, (project) => project.created_by)
  projects!: Projects[];

  @OneToMany(() => ProjectMembers, (projectMember) => projectMember.user)
  projectMembers!: ProjectMembers[];
}
