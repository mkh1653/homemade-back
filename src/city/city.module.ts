import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { City } from './entities/city.entity';
import { ProvinceModule } from 'src/province/province.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([City]),
   ProvinceModule
  ],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
