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
} from '@nestjs/common';
import { SupporterService } from './supporter.service';
import { CreateSupporterDto } from './dto/create-supporter.dto';
import { UpdateSupporterDto } from './dto/update-supporter.dto';
import { SupporterResponseDto } from './dto/supporter-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('supporter')
export class SupporterController {
  constructor(private readonly supporterService: SupporterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSupporterDto: CreateSupporterDto,
  ): Promise<SupporterResponseDto> {
    const supporter = await this.supporterService.create(createSupporterDto);
    return plainToInstance(SupporterResponseDto, supporter, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(): Promise<SupporterResponseDto[]> {
    const supporters = await this.supporterService.findAll();
    return plainToInstance(SupporterResponseDto, supporters, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':publicId')
  async findOne(@Param('publicId') publicId: string) {
    const supporter = await this.supporterService.findOne(publicId);
    return plainToInstance(SupporterResponseDto, supporter, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':publicId')
  async update(
    @Param('publicId') publicId: string,
    @Body() updateSupporterDto: UpdateSupporterDto,
  ): Promise<SupporterResponseDto> {
    const supporter = await this.supporterService.update(
      publicId,
      updateSupporterDto,
    );

    return plainToInstance(SupporterResponseDto, supporter, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('publicId') publicId: string): Promise<void> {
    return await this.supporterService.remove(publicId);
  }
}
