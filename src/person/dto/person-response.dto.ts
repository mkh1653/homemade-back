import { Exclude, Expose, Type } from 'class-transformer';
import { CustomerResponseDto } from 'src/customer/dto/customer-response.dto';
import { ProviderResponseDto } from 'src/provider/dto/provider-response.dto';
import { Person } from '../entities/person.entity';
import { SupporterResponseDto } from 'src/supporter/dto/supporter-response.dto';

export class PersonResponseDto {
  @Exclude()
  id: number;

  @Expose()
  publicId: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  phone: string;

  @Expose()
  nationalityCode?: string;

  @Expose()
  email?: string;

  @Expose()
  avatar?: string;

  @Expose()
  birthday?: Date;

  @Expose()
  isDeleted: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  //   @Expose()
  //   location?: any;

  @Expose()
  @Type(() => CustomerResponseDto)
  customers?: CustomerResponseDto[];

  @Expose()
  @Type(() => ProviderResponseDto)
  providers?: ProviderResponseDto[];

  @Expose()
  @Type(() => SupporterResponseDto)
  supporters?: SupporterResponseDto[];
}
