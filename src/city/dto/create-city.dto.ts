import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCityDto {
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'شناسه استان الزامی است.' })
  @IsUUID()
  provinceId: string;
}
