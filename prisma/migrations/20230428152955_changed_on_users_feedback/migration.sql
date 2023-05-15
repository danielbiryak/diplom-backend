/*
  Warnings:

  - You are about to drop the `AdditionalProperty` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdditionalProperty" DROP CONSTRAINT "AdditionalProperty_post_id_fkey";

-- DropTable
DROP TABLE "AdditionalProperty";

-- CreateTable
CREATE TABLE "UsersFeedback" (
    "id" TEXT NOT NULL,
    "property" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "post_id" TEXT NOT NULL,

    CONSTRAINT "UsersFeedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsersFeedback" ADD CONSTRAINT "UsersFeedback_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
