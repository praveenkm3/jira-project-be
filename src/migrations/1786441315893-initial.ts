import type{ MigrationInterface, QueryRunner } from "typeorm";

export class Initial1786441315893 implements MigrationInterface {
    name = 'Initial1786441315893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD "project_key" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "project_status"`);
        await queryRunner.query(`CREATE TYPE "public"."projects_project_status_enum" AS ENUM('ACTIVE', 'COMPLETED')`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "project_status" "public"."projects_project_status_enum" NOT NULL DEFAULT 'ACTIVE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "project_status"`);
        await queryRunner.query(`DROP TYPE "public"."projects_project_status_enum"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "project_status" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "project_key"`);
    }

}
