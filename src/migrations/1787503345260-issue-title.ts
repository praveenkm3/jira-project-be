import type{ MigrationInterface, QueryRunner } from "typeorm";

export class IssueTitle1787503345260 implements MigrationInterface {
    name = 'IssueTitle1787503345260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" DROP CONSTRAINT "UQ_8917c05f2ce02eb13af152fc05c"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" ADD CONSTRAINT "UQ_8917c05f2ce02eb13af152fc05c" UNIQUE ("issue_title")`);
    }

}
