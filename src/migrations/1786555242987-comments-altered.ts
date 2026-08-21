import type { MigrationInterface, QueryRunner } from "typeorm";

export class CommentsAltered1786555242987 implements MigrationInterface {
  name = "CommentsAltered1786555242987";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" ADD "creator" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_23ecee84b51c8ebc002b703235a" FOREIGN KEY ("creator") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_23ecee84b51c8ebc002b703235a"`,
    );
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "creator"`);
  }
}
