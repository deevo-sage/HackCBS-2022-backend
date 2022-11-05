import { Body, Controller, Get, HttpException, Param, Patch, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UserService } from "./user.service"
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

    /**
     * 
     * Get user by address
     */
    @Get(':address')
    async getUser(@Param('address') address: string) {
        try {
            return await this.user.findUnique(address);
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
        return await this.user.create(data);
    }

    @Patch(':address')
    async updateUser(@Param('address') address: string, @Body() data: Prisma.UserUpdateInput) {
        return await this.user.update(address, data);
    }
}