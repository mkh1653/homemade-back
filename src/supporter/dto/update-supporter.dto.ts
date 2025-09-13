import { PartialType } from '@nestjs/mapped-types';
import { CreateSupporterDto } from './create-supporter.dto';

export class UpdateSupporterDto extends PartialType(CreateSupporterDto) {}
