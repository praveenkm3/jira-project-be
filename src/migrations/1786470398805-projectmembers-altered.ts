import type { MigrationInterface, QueryRunner } from "typeorm";

export class ProjectmembersAltered1786470398805 implements MigrationInterface {
  name = "ProjectmembersAltered1786470398805";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "project_member" UNIQUE ("project_id", "member_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "project_member"`,
    );
  }
}
