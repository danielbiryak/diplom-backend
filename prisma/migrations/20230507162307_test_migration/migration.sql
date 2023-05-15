-- AlterTable
CREATE SEQUENCE chat_messages_id_seq;
ALTER TABLE "chat_messages" ALTER COLUMN "id" SET DEFAULT nextval('chat_messages_id_seq');
ALTER SEQUENCE chat_messages_id_seq OWNED BY "chat_messages"."id";
