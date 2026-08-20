import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";

import { Users } from "./Users.ts";

@Entity("designations")
export class Designation {
  @PrimaryGeneratedColumn("uuid")
  designation_id!: string;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
  })
  designation_name!: string;

  @OneToMany(() => Users, (user) => user.designation)
  users!: Users[];
}