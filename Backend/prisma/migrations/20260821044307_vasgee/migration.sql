-- CreateIndex
CREATE INDEX `Page_workspaceId_isDeleted_idx` ON `Page`(`workspaceId`, `isDeleted`);

-- CreateIndex
CREATE INDEX `Page_parentId_isDeleted_idx` ON `Page`(`parentId`, `isDeleted`);

-- CreateIndex
CREATE INDEX `Page_workspaceId_parentId_isDeleted_idx` ON `Page`(`workspaceId`, `parentId`, `isDeleted`);

-- CreateIndex
CREATE INDEX `Page_isDeleted_deletedAt_idx` ON `Page`(`isDeleted`, `deletedAt`);

-- CreateIndex
CREATE INDEX `Page_workspaceId_position_idx` ON `Page`(`workspaceId`, `position`);

-- RenameIndex
ALTER TABLE `workspace` RENAME INDEX `Workspace_ownerId_fkey` TO `Workspace_ownerId_idx`;
