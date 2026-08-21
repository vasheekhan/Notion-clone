import { Prisma } from "../../generated/prisma/client";

export interface UpdatePageDto {
  title?: string;
  icon?: string;
  coverImage?: string;
  content?: Prisma.InputJsonValue;
}