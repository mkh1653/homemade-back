import { Expose, Type } from 'class-transformer';
import { ProviderSpecialty } from '../entities/provider-specialty.entity';
// import { SpecialtyResponseDto }

export class ProviderSpecialtyResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  experienceYears?: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

//   @Expose()
//   @Type(() => SpecialtyResponseDto) 
//   specialty: SpecialtyResponseDto;
}

