/*
  Warnings:

  - A unique constraint covering the columns `[accessCode]` on the table `Case` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN "accessCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Case_accessCode_key" ON "Case"("accessCode");
