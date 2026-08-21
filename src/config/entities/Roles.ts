import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

import { Users } from "./Users.ts";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  role_id!: string;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
  })
  role_name!: string;

  @OneToMany(() => Users, (user) => user.role)
  users!: Users[];
}
