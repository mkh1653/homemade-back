import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupporterService } from './supporter.service';
import { SupporterController } from './supporter.controller';
import { Supporter } from './entities/supporter.entity';
import { PersonModule } from 'src/person/person.module';


@Module({
  imports: [PersonModule, TypeOrmModule.forFeature([Supporter])],
  controllers: [SupporterController],
  providers: [SupporterService],
})
export class SupporterModule {}
