/*
  Warnings:

  - You are about to drop the column `favUserPosts` on the `pin` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `pin` DROP FOREIGN KEY `Pin_favUserPosts_fkey`;

-- AlterTable
ALTER TABLE `pin` DROP COLUMN `favUserPosts`;

-- CreateTable
CREATE TABLE `Favorite` (
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Pin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
