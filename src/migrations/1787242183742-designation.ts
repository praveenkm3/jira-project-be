import type { MigrationInterface, QueryRunner } from "typeorm";

export class Designation1787242183742 implements MigrationInterface {
  name = "Designation1787242183742";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "designations" ("designation_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "designation_name" character varying(100) NOT NULL, CONSTRAINT "UQ_1c256bf4fcec0947fe58d3fd879" UNIQUE ("designation_name"), CONSTRAINT "PK_ae42f77642a5b08a85d7226fb06" PRIMARY KEY ("designation_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "designation_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_9568a0fda18937f1082a82ecbaf" FOREIGN KEY ("designation_id") REFERENCES "designations"("designation_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_9568a0fda18937f1082a82ecbaf"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "designation_id"`);
    await queryRunner.query(`DROP TABLE "designations"`);
  }
}
