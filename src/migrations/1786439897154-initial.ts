import type{ MigrationInterface, QueryRunner } from "typeorm";

export class Initial1786439897154 implements MigrationInterface {
    name = 'Initial1786439897154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_members" ("project_members_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "project_id" uuid NOT NULL, "member_id" uuid NOT NULL, CONSTRAINT "PK_aaf4f6e42caa5c75c64a8bee1a5" PRIMARY KEY ("project_members_id"))`);
        await queryRunner.query(`CREATE TABLE "projects" ("project_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_name" character varying(100) NOT NULL, "project_description" character varying(500) NOT NULL, "project_status" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, CONSTRAINT "PK_b3613537a59b41f5811258edf99" PRIMARY KEY ("project_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."issues_issue_priority_enum" AS ENUM('High', 'Medium', 'Low')`);
        await queryRunner.query(`CREATE TYPE "public"."issues_issue_status_enum" AS ENUM('Open', 'In Progress', 'Done')`);
        await queryRunner.query(`CREATE TABLE "issues" ("issue_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issue_number" character varying(150) NOT NULL, "issue_title" character varying(200) NOT NULL, "issue_description" text NOT NULL, "issue_type" character varying(50) NOT NULL, "issue_priority" "public"."issues_issue_priority_enum" NOT NULL DEFAULT 'Medium', "issue_status" "public"."issues_issue_status_enum" NOT NULL, "issue_due_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "project_id" uuid NOT NULL, "assignee_id" uuid, "reporter_id" uuid NOT NULL, CONSTRAINT "PK_7110f1fe86859dfef01b7d46673" PRIMARY KEY ("issue_id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("notification_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_read" boolean NOT NULL, "message" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "issue_id" uuid NOT NULL, "created_by" uuid, CONSTRAINT "PK_eaedfe19f0f765d26afafa85956" PRIMARY KEY ("notification_id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("comment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "issue_id" uuid NOT NULL, CONSTRAINT "PK_eb0d76f2ca45d66a7de04c7c72b" PRIMARY KEY ("comment_id"))`);
        await queryRunner.query(`ALTER TABLE "project_members" ADD CONSTRAINT "FK_b5729113570c20c7e214cf3f58d" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_members" ADD CONSTRAINT "FK_0fe49d1dbe3867d97de555f675b" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_8a7ccdb94bcc8635f933c8f8080" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issues" ADD CONSTRAINT "FK_11f35e8296e10c229e7b68c68d4" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issues" ADD CONSTRAINT "FK_7da282c871a9b6497da2cecf869" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issues" ADD CONSTRAINT "FK_394a6ced54c634dfadea1618d2a" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_3947aa0208fb54594ba1139e592" FOREIGN KEY ("issue_id") REFERENCES "issues"("issue_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_19629e8eb1e6023c4c73e661c82" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4ce924bcd63bee0fccc7fe1d8f6" FOREIGN KEY ("issue_id") REFERENCES "issues"("issue_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4ce924bcd63bee0fccc7fe1d8f6"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_19629e8eb1e6023c4c73e661c82"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_3947aa0208fb54594ba1139e592"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP CONSTRAINT "FK_394a6ced54c634dfadea1618d2a"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP CONSTRAINT "FK_7da282c871a9b6497da2cecf869"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP CONSTRAINT "FK_11f35e8296e10c229e7b68c68d4"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_8a7ccdb94bcc8635f933c8f8080"`);
        await queryRunner.query(`ALTER TABLE "project_members" DROP CONSTRAINT "FK_0fe49d1dbe3867d97de555f675b"`);
        await queryRunner.query(`ALTER TABLE "project_members" DROP CONSTRAINT "FK_b5729113570c20c7e214cf3f58d"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "issues"`);
        await queryRunner.query(`DROP TYPE "public"."issues_issue_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."issues_issue_priority_enum"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "project_members"`);
    }

}
