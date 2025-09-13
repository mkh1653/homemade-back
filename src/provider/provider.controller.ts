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
  Query,
} from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';

@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProviderDto: CreateProviderDto,
  ): Promise<ProviderResponseDto> {
    return await this.providerService.create(createProviderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('relations') relations?: string,
  ): Promise<ProviderResponseDto[]> {
    let parsedRelations: string[] | undefined;
    if (relations) {
      parsedRelations = relations.split(',').map((rel) => rel.trim());
    }
    return await this.providerService.findAll({ relations: parsedRelations });
  }

  @Get(':publicId')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('publicId') publicId: string,
  ): Promise<ProviderResponseDto> {
    return await this.providerService.findOne(publicId);
  }

  @Patch(':publicId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('publicId') publicId: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ): Promise<ProviderResponseDto> {
    return await this.providerService.update(publicId, updateProviderDto);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('publicId') publicId: string): Promise<void> {
    return await this.providerService.remove(publicId);
  }
}
