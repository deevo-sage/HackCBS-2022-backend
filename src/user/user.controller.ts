import { Body, Controller, Get, HttpException, Param, Post } from "@nestjs/common";
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
        try {
            return await this.prisma.user.findFirstOrThrow({ where: { address } });
        } catch (error) {
            // return status code 400
            throw new HttpException('User not found', 404);
        }
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