import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProvinceService } from './province.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';
import { Province } from './entities/province.entity';
import { ProvinceResponseDto } from './dto/province-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPPORT)
  async create(
    @Body() createProvinceDto: CreateProvinceDto,
  ): Promise<ProvinceResponseDto> {
    const province = await this.provinceService.create(createProvinceDto);
    return plainToInstance(ProvinceResponseDto, province, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(UserRole.SUPPORT, UserRole.PROVIDER, UserRole.CUSTOMER)
  async findAll(): Promise<ProvinceResponseDto[]> {
    const provinces = await this.provinceService.findAll();
    return plainToInstance(ProvinceResponseDto, provinces, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':publicId')
  @Roles(UserRole.SUPPORT, UserRole.PROVIDER, UserRole.CUSTOMER)
  async findOne(
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ): Promise<ProvinceResponseDto> {
    return await this.provinceService.findOne(publicId);
  }

  @Patch(':publicId')
  @Roles(UserRole.SUPPORT)
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() updateProvinceDto: UpdateProvinceDto,
  ): Promise<ProvinceResponseDto> {
    return await this.provinceService.update(publicId, updateProvinceDto);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SUPPORT)
  async remove(
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ): Promise<void> {
    return await this.provinceService.remove(publicId);
  }
}
