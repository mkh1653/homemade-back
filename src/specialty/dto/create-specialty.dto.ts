import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateSpecialtyDto {
  @IsNotEmpty({ message: 'Specialty name is required.' })
  @IsString({ message: 'Specialty name must be a string.' })
  @MaxLength(255, { message: 'Specialty name cannot exceed 255 characters.' })
  name: string;

  @IsNotEmpty({ message: 'Specialty description is required.' })
  @IsString({ message: 'Specialty description must be a string.' })
  description: string;

  @IsOptional()
  @IsString({ message: 'Icon path must be a string.' })
  icon?: string;
}
