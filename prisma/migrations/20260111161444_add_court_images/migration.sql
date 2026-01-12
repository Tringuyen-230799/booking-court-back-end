-- CreateTable
CREATE TABLE "court_images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "court_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "court_images" ADD CONSTRAINT "court_images_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
