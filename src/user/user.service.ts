import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
      ) {}
    

    async create(data: Prisma.UserCreateInput) {
        return await this.prisma.user.create({
          data,
        });
    }

    async findUnique(address: string) {
        return await this.prisma.user.findUniqueOrThrow({ where: { address } });
    }

    async update(address: string, data: Prisma.UserUpdateInput) {
        return await this.prisma.user.update({
          data,
          where: { address },
        });
    }

}