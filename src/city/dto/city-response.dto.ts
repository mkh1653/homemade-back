import { Expose, Type } from 'class-transformer';
import { ProvinceResponseDto } from 'src/province/dto/province-response.dto';

export class CityResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ProvinceResponseDto)
  province: ProvinceResponseDto;
}
