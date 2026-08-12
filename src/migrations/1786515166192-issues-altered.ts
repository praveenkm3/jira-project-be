import type{ MigrationInterface, QueryRunner } from "typeorm";

export class IssuesAltered1786515166192 implements MigrationInterface {
    name = 'IssuesAltered1786515166192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD "next_issue_number" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "UQ_c655a93948868c0af4c102745e0" UNIQUE ("project_key")`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_number"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "issue_number" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_due_date"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "issue_due_date" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_due_date"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "issue_due_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_number"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "issue_number" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "UQ_c655a93948868c0af4c102745e0"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "next_issue_number"`);
    }

}
