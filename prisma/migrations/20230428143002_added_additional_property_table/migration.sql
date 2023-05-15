-- CreateTable
CREATE TABLE "AdditionalProperty" (
    "id" TEXT NOT NULL,
    "property" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "post_id" TEXT NOT NULL,

    CONSTRAINT "AdditionalProperty_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdditionalProperty" ADD CONSTRAINT "AdditionalProperty_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
