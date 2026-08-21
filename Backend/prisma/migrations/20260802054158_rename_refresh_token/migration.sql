/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `session` table. All the data in the column will be lost.
  - Added the required column `refreshTokenHash` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Session_refreshToken_key` ON `session`;

-- AlterTable
ALTER TABLE `session` DROP COLUMN `refreshToken`,
    ADD COLUMN `refreshTokenHash` VARCHAR(191) NOT NULL;
