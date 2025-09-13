import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { SpecialtyModule } from 'src/specialty/specialty.module';
import { CustomerModule } from 'src/customer/customer.module';
import { ProviderModule } from 'src/provider/provider.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    SpecialtyModule,
    CustomerModule,
    ProviderModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
