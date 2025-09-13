import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalResponseDto } from './dto/proposal-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUserPayload } from 'src/common/interfaces/auth-user-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proposal')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.PROVIDER)
  async create(
    @Body() createProposalDto: CreateProposalDto,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<ProposalResponseDto> {
    return await this.proposalService.create(createProposalDto, user);
  }

  @Get()
  @Roles(UserRole.PROVIDER, UserRole.SUPPORT, UserRole.CUSTOMER)
  async findAll(
    @CurrentUser() user: AuthUserPayload,
  ): Promise<ProposalResponseDto[]> {
    return this.proposalService.findAll(user);
  }

  @Get(':publicId')
  @Roles(UserRole.PROVIDER, UserRole.SUPPORT, UserRole.CUSTOMER)
  async findOne(
    @Param('publicId') publicId: string,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<ProposalResponseDto> {
    const proposal = await this.proposalService.findOne(publicId, user, {
      relations: ['order', 'provider', 'order.customer'],
    });

    return proposal;
  }

  @Patch(':publicId')
  @Roles(UserRole.PROVIDER, UserRole.SUPPORT)
  async update(
    @Param('publicId') publicId: string,
    @Body() updateProposalDto: UpdateProposalDto,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<ProposalResponseDto> {
    return await this.proposalService.update(publicId, updateProposalDto, user);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.PROVIDER, UserRole.SUPPORT)
  async remove(
    @Param('publicId') publicId: string,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<void> {
    await this.proposalService.remove(publicId, user);
  }
}
