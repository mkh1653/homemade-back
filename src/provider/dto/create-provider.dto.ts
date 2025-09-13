import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';
import { CreateProviderSpecialtyDto } from 'src/provider-specialty/dto/create-provider-specialty.dto';

export class CreateProviderDto {
  @IsOptional()
  @IsString({ message: 'Bio must be a string.' })
  bio?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;

  @IsNotEmpty({ message: 'Provider must have at least one specialty.' })
  @IsArray({ message: 'Provider specialties must be an array.' })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProviderSpecialtyDto)
  providerSpecialties?: CreateProviderSpecialtyDto[];
}
