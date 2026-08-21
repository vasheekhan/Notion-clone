-- AlterTable
ALTER TABLE `verificationcode` MODIFY `type` ENUM('REGISTER', 'LOGIN', 'FORGOT_PASSWORD') NOT NULL;
