import { IsInt, Min, Max, IsString, IsOptional, Length } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt({ message: 'Rating must be an integer.' })
  @Min(1, { message: 'Rating must be at least 1.' })
  @Max(5, { message: 'Rating cannot be more than 5.' })
  rating?: number;

  @IsOptional()
  @IsString({ message: 'Comment must be a string.' })
  @Length(0, 1000, { message: 'Comment cannot exceed 1000 characters.' })
  comment?: string;
}