import type{ MigrationInterface, QueryRunner } from "typeorm";

export class IssuesAltered31787118448820 implements MigrationInterface {
    name = 'IssuesAltered31787118448820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" RENAME COLUMN "issue_status" TO "status_id"`);
        await queryRunner.query(`ALTER TYPE "public"."issues_issue_status_enum" RENAME TO "issues_status_id_enum"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "status_id"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "status_id" uuid`);
        await queryRunner.query(`ALTER TABLE "issues" ADD CONSTRAINT "FK_7d7da16adb251f544b1db256fdc" FOREIGN KEY ("status_id") REFERENCES "project_statuses"("status_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" DROP CONSTRAINT "FK_7d7da16adb251f544b1db256fdc"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "status_id"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "status_id" "public"."issues_status_id_enum" NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."issues_status_id_enum" RENAME TO "issues_issue_status_enum"`);
        await queryRunner.query(`ALTER TABLE "issues" RENAME COLUMN "status_id" TO "issue_status"`);
    }

}
