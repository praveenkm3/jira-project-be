import type { MigrationInterface, QueryRunner } from "typeorm";

export class RoleTableAdded1787071783184 implements MigrationInterface {
  name = "RoleTableAdded1787071783184";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("role_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_name" character varying(100) NOT NULL, CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039" UNIQUE ("role_name"), CONSTRAINT "PK_09f4c8130b54f35925588a37b6a" PRIMARY KEY ("role_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
