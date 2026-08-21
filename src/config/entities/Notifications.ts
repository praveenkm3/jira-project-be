import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Issues } from "./Issues.ts";
import { Users } from "./Users.ts";

@Entity("notifications")
export class Notifications {
  @PrimaryGeneratedColumn("uuid")
  notification_id!: string;

  @ManyToOne(() => Issues, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "issue_id" })
  issuse_id!: Issues;

  @ManyToOne(() => Users, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "created_by" })
  created_by!: Users;

  @ManyToOne(() => Users, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "reciever_id" })
  reciever!: Users;

  @Column({ type: "boolean", name: "is_read" })
  is_read!: boolean;

  @Column({ type: "text", name: "message" })
  message!: string;

  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
  })
  createdAt!: Date;
}
