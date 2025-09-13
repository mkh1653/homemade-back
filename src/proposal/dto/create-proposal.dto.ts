import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateProposalDto {
  @IsNotEmpty({ message: 'Price is required.' })
  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0, { message: 'Price cannot be negative.' })
  price: number;

  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters.' }) // مثلا 2000 کاراکتر
  description?: string;

  @IsUUID('4', { message: 'Order publicId must be a valid UUID.' })
  @IsNotEmpty({ message: 'Order publicId is required.' })
  orderPublicId: string;
}
