import type{ MigrationInterface, QueryRunner } from "typeorm";

export class ProjectStatuses1787115901422 implements MigrationInterface {
    name = 'ProjectStatuses1787115901422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_statuses" ("status_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status_name" character varying(100) NOT NULL, "project_id" uuid NOT NULL, CONSTRAINT "PK_d76f01a2319fe4e1b70d76b7409" PRIMARY KEY ("status_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9756d7d4d9d58de8632fc6cf82" ON "project_statuses"  ("project_id", "status_name") `);
        await queryRunner.query(`ALTER TABLE "project_statuses" ADD CONSTRAINT "FK_12e48935c08ebc5ba11ec26d6bf" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_statuses" DROP CONSTRAINT "FK_12e48935c08ebc5ba11ec26d6bf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9756d7d4d9d58de8632fc6cf82"`);
        await queryRunner.query(`DROP TABLE "project_statuses"`);
    }

}
