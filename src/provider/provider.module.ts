import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { Provider } from './entities/provider.entity';
import { PersonModule } from 'src/person/person.module';
import { ProviderSpecialtyModule } from 'src/provider-specialty/provider-specialty.module';

@Module({
  imports: [PersonModule, ProviderSpecialtyModule, TypeOrmModule.forFeature([Provider])],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService]
})
export class ProviderModule {}
