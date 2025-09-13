import { Expose, Type } from "class-transformer";
import { PersonResponseDto } from "src/person/dto/person-response.dto";

export class SupporterResponseDto {
  @Expose()
  @Type(() => PersonResponseDto)
  person: PersonResponseDto;
}
