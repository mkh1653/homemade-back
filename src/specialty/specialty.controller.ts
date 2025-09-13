import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { SpecialtyResponseDto } from './dto/specialty-response.dto';

import { Roles } from 'src/common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/role.enum';
import { plainToInstance } from 'class-transformer';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPPORT)
@Controller('specialty')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtyService.create(createSpecialtyDto);
    return plainToInstance(SpecialtyResponseDto, specialty, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':publicId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('publicId') publicId: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtyService.update(
      publicId,
      updateSpecialtyDto,
    );
    return plainToInstance(SpecialtyResponseDto, specialty, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('relations') relations?: string,
  ): Promise<SpecialtyResponseDto[]> {
    let isActiveFilter: boolean | undefined;
    if (isActive !== undefined) {
      isActiveFilter = isActive === 'true';
    }

    let parsedRelations: string[] | undefined;
    if (relations) {
      parsedRelations = relations.split(',').map((rel) => rel.trim());
    }
    const specialties = await this.specialtyService.findAll({
      isActive: isActiveFilter,
      relations: parsedRelations,
    });
    return plainToInstance(SpecialtyResponseDto, specialties, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('publicId') publicId: string): Promise<void> {
    return await this.specialtyService.remove(publicId);
  }

  @Get(':publicId')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('publicId') publicId: string,
  ): Promise<SpecialtyResponseDto> {
    return await this.specialtyService.findOne(publicId);
  }
}
