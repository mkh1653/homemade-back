import {
  Controller,
  Body,
  Post,
  Get,
  Param,
  Query,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonResponseDto } from './dto/person-response.dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('relations') relations?: string,
  ): Promise<PersonResponseDto[]> {
    let relationOptions = {};
    if (relations) {
      relationOptions = { relations: relations.split(',') };
    }
    const persons = await this.personService.findAll(relationOptions);
    return persons;
  }

  @Get(':publicId')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('publicId') publicId: string,
    @Query('relations') relations?: string,
  ): Promise<PersonResponseDto> {
    let relationOptions = {};
    if (relations) {
      relationOptions = { relations: relations.split(',') };
    }
    const person = await this.personService.findOne(publicId, relationOptions);
    return person;
  }

  @Patch(':publicId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('publicId') publicId: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<PersonResponseDto> {
    const person = await this.personService.update(publicId, updatePersonDto);
    return person;
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('publicId') publicId: string,
  ): Promise<PersonResponseDto> {
    const person = await this.personService.remove(publicId);
    return person;
  }
}
