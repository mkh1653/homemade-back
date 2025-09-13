import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';
import { Proposal } from './entities/proposal.entity';
import { ProviderModule } from 'src/provider/provider.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [ProviderModule, OrderModule, TypeOrmModule.forFeature([Proposal])],
  controllers: [ProposalController],
  providers: [ProposalService],
})
export class ProposalModule {}
