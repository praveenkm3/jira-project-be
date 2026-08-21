import type{ MigrationInterface, QueryRunner } from "typeorm";

export class IssuesStartDateColumn1787159150628 implements MigrationInterface {
    name = 'IssuesStartDateColumn1787159150628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" ADD "issue_start_date" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_start_date"`);
    }

}
