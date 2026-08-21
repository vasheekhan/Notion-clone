export interface Workspace {
  id: string;
  name: string;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface Page {
  id: string;
  title: string;
  content?: any;
  icon?: string | null;
  coverImage?: string | null;
  position: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  authorId: string;
  parentId?: string | null;
  children?: Page[];
}