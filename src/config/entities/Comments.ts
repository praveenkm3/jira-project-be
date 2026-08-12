import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Issues } from "./Issues.ts";
import { Users } from "./Users.ts";

@Entity("comments")
export class Comments {
  @PrimaryGeneratedColumn("uuid")
  comment_id!: string;

  @ManyToOne(() => Issues, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "issue_id" })
  issue_id!: Issues;

  @Column({ type: "text", name: "comment" })
  comment!: string;

  @ManyToOne(() => Users, {
    nullable: false,
  })
  @JoinColumn({ name: "creator" })
  created!: Users;

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
