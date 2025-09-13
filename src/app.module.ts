import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonModule } from './person/person.module';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { ProviderSpecialtyModule } from './provider-specialty/provider-specialty.module';
import { ProviderModule } from './provider/provider.module';
import { CustomerModule } from './customer/customer.module';

import { ProposalModule } from './proposal/proposal.module';
import { ProvinceModule } from './province/province.module';
import { CityModule } from './city/city.module';
import { LocationModule } from './location/location.module';
import { SupporterModule } from './supporter/supporter.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PersonModule,
    AuthModule,
    CustomerModule,
    OrderModule,
    ReviewModule,
    ProposalModule,
    SupporterModule,
    UserModule,
    ProviderModule,
    SpecialtyModule,
    ProviderSpecialtyModule,
    ProvinceModule,
    CityModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '16537319',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    JwtStrategy
  ],
})
export class AppModule {}
