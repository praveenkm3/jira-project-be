import type { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationsAltered1786523106511 implements MigrationInterface {
  name = "NotificationsAltered1786523106511";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "reciever_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_c282fa5289b0e2a4546da7a084d" FOREIGN KEY ("reciever_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_c282fa5289b0e2a4546da7a084d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "reciever_id"`,
    );
  }
}
