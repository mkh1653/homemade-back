import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProviderSpecialtyDto {
  @IsNotEmpty({ message: 'Specialty ID is required.' })
  @IsUUID('4', { message: 'Specialty ID must be a valid UUID.' })
  specialtyPublicId: string;

  @IsOptional()
  @IsNumber({}, { message: 'Experience years must be a number.' })
  @Min(0, { message: 'Experience years cannot be negative.' })
  experienceYears?: number;
}
