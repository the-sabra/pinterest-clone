/*
  Warnings:

  - You are about to drop the column `passwordRestToken` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `restTokenExp` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `passwordRestToken`,
    DROP COLUMN `restTokenExp`,
    ADD COLUMN `passwordResetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExp` DATETIME(3) NULL;
