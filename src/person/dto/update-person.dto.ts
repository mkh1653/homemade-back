import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonDto } from './create-person.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
  @IsOptional()
  @IsNumber()
  locationId?: number;
}
