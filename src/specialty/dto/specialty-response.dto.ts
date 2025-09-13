import { Exclude, Expose, Type } from 'class-transformer';

export class SpecialtyResponseDto {
  @Exclude()
  id: number;

  @Expose()
  publicId: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  icon?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}