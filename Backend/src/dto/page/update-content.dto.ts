import { Prisma } from "../../generated/prisma/client";

export interface UpdateContentDto {
  content: Prisma.InputJsonValue;
}