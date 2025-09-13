import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from 'src/common/enums/order-status.entity';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status.' })
  status?: OrderStatus;

  @IsOptional()
  @IsUUID('4', { message: 'Selected Provider ID must be a valid UUID.' })
  selectedProviderId?: string;
}
