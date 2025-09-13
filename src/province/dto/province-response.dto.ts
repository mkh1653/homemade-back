import { Exclude, Expose, Type } from 'class-transformer';
import { CityResponseDto } from 'src/city/dto/city-response.dto';

export class ProvinceResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => CityResponseDto)
  cities: CityResponseDto[];
}
