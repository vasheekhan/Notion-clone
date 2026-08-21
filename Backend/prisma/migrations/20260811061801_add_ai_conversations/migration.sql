-- CreateTable
CREATE TABLE `AIConversation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'New conversation',
    `userId` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AIConversation_userId_idx`(`userId`),
    INDEX `AIConversation_pageId_idx`(`pageId`),
    INDEX `AIConversation_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIMessage` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `role` ENUM('user', 'assistant') NOT NULL,
    `content` TEXT NOT NULL,
    `action` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AIMessage_conversationId_idx`(`conversationId`),
    INDEX `AIMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AIConversation` ADD CONSTRAINT `AIConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIConversation` ADD CONSTRAINT `AIConversation_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIMessage` ADD CONSTRAINT `AIMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `AIConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
