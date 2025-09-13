import { Expose, Type } from 'class-transformer';
import { ProposalStatus } from 'src/common/enums/proposal-status.enum';
import { OrderResponseDto } from 'src/order/dto/order-response.dto';
import { ProviderResponseDto } from 'src/provider/dto/provider-response.dto';

export class ProposalResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  price: number;

  @Expose()
  description?: string;

  @Expose()
  status: ProposalStatus;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @Type(() => OrderResponseDto)
  order: OrderResponseDto;

  @Expose()
  @Type(() => ProviderResponseDto)
  provider: ProviderResponseDto;
}
