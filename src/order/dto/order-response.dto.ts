import { Expose, Type } from 'class-transformer';
import { OrderStatus } from 'src/common/enums/order-status.entity';
import { CustomerResponseDto } from 'src/customer/dto/customer-response.dto';
import { ProposalResponseDto } from 'src/proposal/dto/proposal-response.dto';
import { ProviderResponseDto } from 'src/provider/dto/provider-response.dto';
import { SpecialtyResponseDto } from 'src/specialty/dto/specialty-response.dto';
import { Order } from '../entities/order.entity';

export class OrderResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  budget: number;

  @Expose()
  deadline?: Date;

  @Expose()
  status: OrderStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => CustomerResponseDto)
  customer: CustomerResponseDto;

  @Expose()
  @Type(() => ProviderResponseDto)
  selectedProvider?: ProviderResponseDto;

  @Expose()
  @Type(() => SpecialtyResponseDto)
  specialty: SpecialtyResponseDto;

  @Expose()
  @Type(() => ProposalResponseDto)
  proposals?: ProposalResponseDto[];
}
