import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecialtyDto } from './create-specialty.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSpecialtyDto extends PartialType(CreateSpecialtyDto) {
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value.' })
  isActive?: boolean;
}
