import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/role.enum';
import { City } from './entities/city.entity';
import { CityResponseDto } from './dto/city-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FindManyOptions } from 'typeorm';

@Controller('city')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPPORT)
  async create(@Body() createCityDto: CreateCityDto): Promise<CityResponseDto> {
    return await this.cityService.create(createCityDto);
  }

  @Get()
  @Roles(UserRole.SUPPORT, UserRole.CUSTOMER, UserRole.PROVIDER)
  async findAll(@Query() query: any): Promise<CityResponseDto[]> {
    const { where, skip, take, name } = query;

    const options: FindManyOptions<City> = {
      where: where,
      skip: parseInt(skip, 10) || 0,
      take: parseInt(take, 10) || 10,
    };
    return await this.cityService.findAll(options, name);
  }

  @Get(':publicId')
  @Roles(UserRole.SUPPORT, UserRole.CUSTOMER, UserRole.PROVIDER)
  async findOne(
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ): Promise<CityResponseDto> {
    return await this.cityService.findOne(publicId);
  }

  @Patch(':publicId')
  @Roles(UserRole.SUPPORT)
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() updateCityDto: UpdateCityDto,
  ): Promise<CityResponseDto> {
    return await this.cityService.update(publicId, updateCityDto);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SUPPORT)
  async remove(
    @Param('publicId', ParseUUIDPipe) publicId: string,
  ): Promise<void> {
    return await this.cityService.remove(publicId);
  }
}
