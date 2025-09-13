import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query('relations') relations?: string) {
    let relationOptions = {};
    if (relations) {
      relationOptions = { relations: relations.split(',') };
    }
    return await this.userService.findAll(relationOptions);
  }

  @Get(':publicId')
  async findOne(@Param('publicId') publicId: string) {
    return await this.userService.findOne(publicId);
  }

  @Patch(':publicId')
  async update(
    @Param('publicId') publicId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserStatus(publicId, updateUserDto.isActive);
  }
}
