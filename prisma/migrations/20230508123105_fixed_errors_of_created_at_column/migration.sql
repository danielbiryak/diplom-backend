/*
  Warnings:

  - You are about to drop the column `createedAt` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `createedAt` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `createedAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "createedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "createedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
