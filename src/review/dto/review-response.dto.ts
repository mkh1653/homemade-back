import { Expose, Type } from 'class-transformer';
import { CustomerResponseDto } from 'src/customer/dto/customer-response.dto';
import { ProviderResponseDto } from 'src/provider/dto/provider-response.dto';
import { OrderResponseDto } from 'src/order/dto/order-response.dto';

export class ReviewResponseDto {
  @Expose()
  publicId: string;

  @Expose()
  rating: number;

  @Expose()
  comment: string;

  @Expose()
  @Type(() => OrderResponseDto)
  order: OrderResponseDto;

  @Expose()
  @Type(() => CustomerResponseDto)
  customer: CustomerResponseDto;

  @Expose()
  @Type(() => ProviderResponseDto)
  provider: ProviderResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
