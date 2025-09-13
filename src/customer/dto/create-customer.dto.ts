import { ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { CreatePersonDto } from 'src/person/dto/create-person.dto';

export class CreateCustomerDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;
}
