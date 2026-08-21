import type { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1786448021893 implements MigrationInterface {
  name = "Initial1786448021893";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "UQ_3f4575a143027d737796f033dc9" UNIQUE ("project_name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "UQ_3f4575a143027d737796f033dc9"`,
    );
  }
}
