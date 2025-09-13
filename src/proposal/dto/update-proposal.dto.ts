import { IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProposalDto } from './create-proposal.dto';
import { ProposalStatus } from 'src/common/enums/proposal-status.enum';

export class UpdateProposalDto extends PartialType(CreateProposalDto) {
  @IsOptional()
  @IsEnum(ProposalStatus, { message: 'Invalid proposal status.' })
  status?: ProposalStatus;
}
