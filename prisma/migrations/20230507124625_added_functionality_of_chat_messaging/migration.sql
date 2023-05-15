-- AlterTable
ALTER TABLE "users" ADD COLUMN     "socketId" TEXT;

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" INTEGER NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);
