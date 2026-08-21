/*
  Warnings:

  - Added the required column `name` to the `VerificationCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `VerificationCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `verificationcode` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `passwordHash` VARCHAR(191) NOT NULL;
