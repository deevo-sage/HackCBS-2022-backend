import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('user')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

    /**
     * 
     * Get user by address
     */
    @Get(':address')
    async getUser(@Param('address') address: string) {
        return await this.prisma.user.findUnique({ rejectOnNotFound: true, where: { address } });
    }

    /**
     * 
     * Create user
     * @param data
     * @returns 
     */
    @Post()
    async createUser(@Body() data: Prisma.UserCreateInput) {
        return await this.prisma.user.create({ data });
    }

}