import type { MigrationInterface, QueryRunner } from "typeorm";

export class IssuesAltered21786519554679 implements MigrationInterface {
  name = "IssuesAltered21786519554679";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "issues" ADD CONSTRAINT "UQ_8917c05f2ce02eb13af152fc05c" UNIQUE ("issue_title")`,
    );
    await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."issues_issue_type_enum" AS ENUM('Bug', 'Task', 'Feature')`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD "issue_type" "public"."issues_issue_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_type"`);
    await queryRunner.query(`DROP TYPE "public"."issues_issue_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "issues" ADD "issue_type" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" DROP CONSTRAINT "UQ_8917c05f2ce02eb13af152fc05c"`,
    );
  }
}
