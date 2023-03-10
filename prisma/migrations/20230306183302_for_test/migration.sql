/*
  Warnings:

  - You are about to drop the column `RestTokenExp` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `RestTokenExp`,
    ADD COLUMN `restTokenExp` DATETIME(3) NULL;
