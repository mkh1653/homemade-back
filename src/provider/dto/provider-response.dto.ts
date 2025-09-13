import { Expose, Type } from 'class-transformer';
import { PersonResponseDto } from 'src/person/dto/person-response.dto';
import { ProviderSpecialtyResponseDto } from 'src/provider-specialty/dto/provider-specialty-response.dt';
import { Provider } from '../entities/provider.entity';
import { ReviewResponseDto } from 'src/review/dto/review-response.dto';

export class ProviderResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  bio?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => PersonResponseDto)
  person: PersonResponseDto;

  @Expose()
  @Type(() => ProviderSpecialtyResponseDto)
  providerSpecialties: ProviderSpecialtyResponseDto[];

  @Expose()
  @Type(() => ReviewResponseDto)
  reviews: ReviewResponseDto[];
}
