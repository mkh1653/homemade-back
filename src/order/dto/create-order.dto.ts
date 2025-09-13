import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Title is required.' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Description is required.' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Budget is required.' })
  @IsNumber({}, { message: 'Budget must be a number.' })
  @Min(0, { message: 'Budget cannot be negative.' })
  budget: number;

  @IsOptional()
  @IsDateString({}, { message: 'Deadline must be a valid date string.' })
  deadline?: Date;

  @IsNotEmpty({ message: 'Specialty ID is required.' })
  @IsUUID('4', { message: 'Specialty ID must be a valid UUID.' })
  specialtyId: string;
}
