import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { LocationModule } from 'src/location/location.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, LocationModule, TypeOrmModule.forFeature([Person])],
  providers: [PersonService],
  controllers: [PersonController],
  exports: [PersonService],
})
export class PersonModule {}
