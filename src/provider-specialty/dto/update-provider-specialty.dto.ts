import { IsOptional, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderSpecialtyDto } from './create-provider-specialty.dto';

export class UpdateProviderSpecialtyDto extends PartialType(
  CreateProviderSpecialtyDto,
) {
  @IsOptional()
  @IsUUID('4', { message: 'Provider Specialty publicId must be a valid UUID.' })
  publicId?: string;
}
