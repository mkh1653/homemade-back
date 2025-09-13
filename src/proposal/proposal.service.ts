import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { Proposal } from './entities/proposal.entity';
import { FindOneOptions, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderService } from 'src/provider/provider.service';
import { OrderService } from 'src/order/order.service';
import { OrderStatus } from 'src/common/enums/order-status.entity';
import { ProposalStatus } from 'src/common/enums/proposal-status.enum';
import { UserRole } from 'src/common/enums/role.enum';
import { AuthUserPayload } from 'src/common/interfaces/auth-user-payload.interface';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    private readonly providerService: ProviderService,
    private readonly orderService: OrderService,
  ) {}

  async create(
    createProposalDto: CreateProposalDto,
    currentUser: AuthUserPayload,
  ): Promise<Proposal> {
    if (currentUser.role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Only providers can create proposals.');
    }

    const { orderPublicId, ...proposalDetails } = createProposalDto;
    const provider = await this.providerService.findOne(
      currentUser.providerPublicId,
    );

    const order = await this.orderService.findOne(orderPublicId, currentUser, {
      relations: ['customer', 'proposals'],
    });

    if (order.status !== OrderStatus.PENDING_PROPOSALS) {
      throw new BadRequestException(
        `Cannot make a proposal for an order with status "${order.status}". Only PENDING orders can receive proposals.`,
      );
    }

    const existingProposal = await this.proposalRepository.findOne({
      where: {
        order: { id: order.id },
        provider: { id: provider.id },
      },
    });

    if (existingProposal) {
      throw new ConflictException(
        `Provider "${currentUser.providerPublicId}" has already submitted a proposal for Order "${orderPublicId}".`,
      );
    }

    const proposal = this.proposalRepository.create({
      ...proposalDetails,
      order,
      provider,
      status: ProposalStatus.PENDING,
    });
    return await this.proposalRepository.save(proposal);
  }

  async findAll(currentUser: AuthUserPayload): Promise<Proposal[]> {
    const queryBuilder = this.proposalRepository.createQueryBuilder('proposal');
    queryBuilder.leftJoinAndSelect('proposal.order', 'order');
    queryBuilder.leftJoinAndSelect('proposal.provider', 'provider');
    queryBuilder.leftJoinAndSelect('order.customer', 'customer');

    if (currentUser.role === UserRole.CUSTOMER) {
      queryBuilder.andWhere('customer.publicId = :customerPublicId', {
        customerPublicId: currentUser.customerPublicId,
      });
    } else if (currentUser.role === UserRole.PROVIDER) {
      queryBuilder.andWhere('provider.publicId = :providerPublicId', {
        providerPublicId: currentUser.providerPublicId,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOne(
    identifier: number | string,
    currentUser: AuthUserPayload,
    options?: FindOneOptions<Proposal>,
  ): Promise<Proposal> {
    let whereCondition: FindOneOptions<Proposal>['where'];

    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }

    const proposal = await this.proposalRepository.findOne({
      where: whereCondition,
      ...options,
    });

    const isCustomer =
      currentUser.role === UserRole.CUSTOMER &&
      proposal.order.customer.publicId === currentUser.customerPublicId;
    const isProvider =
      currentUser.role === UserRole.PROVIDER &&
      proposal.provider.publicId === currentUser.providerPublicId;
    const isSupport = currentUser.role === UserRole.SUPPORT;

    if (!isCustomer && !isProvider && !isSupport) {
      throw new ForbiddenException(
        'You are not authorized to view this proposal.',
      );
    }

    return proposal;
  }

  async update(
    identifier: number | string,
    updateProposalDto: UpdateProposalDto,
    currentUser: AuthUserPayload,
  ): Promise<Proposal> {
    const proposal = await this.findOne(identifier, currentUser, {
      relations: ['order', 'provider', 'order.customer'],
    });

    const isCustomer =
      currentUser.role === UserRole.CUSTOMER &&
      proposal.order.customer.publicId === currentUser.customerPublicId;
    const isProvider =
      currentUser.role === UserRole.PROVIDER &&
      proposal.provider.publicId === currentUser.providerPublicId;
    const isSupport = currentUser.role === UserRole.SUPPORT;

    if (!isCustomer && !isProvider && !isSupport) {
      throw new ForbiddenException(
        'You are not authorized to update this proposal.',
      );
    }

    if (
      updateProposalDto.price !== undefined ||
      updateProposalDto.description !== undefined
    ) {
      if (!isProvider && !isSupport) {
        throw new ForbiddenException(
          'Only providers or supporters can update proposal details.',
        );
      }
      if (proposal.status !== ProposalStatus.PENDING) {
        throw new BadRequestException(
          `Cannot update details of a proposal with status "${proposal.status}".`,
        );
      }

      if (updateProposalDto.price !== undefined) {
        proposal.price = updateProposalDto.price;
      }
      if (updateProposalDto.description !== undefined) {
        proposal.description = updateProposalDto.description;
      }
    }

    if (
      updateProposalDto.status !== undefined &&
      updateProposalDto.status !== proposal.status
    ) {
      await this.handleProposalStatusUpdate(
        proposal,
        updateProposalDto.status,
        currentUser,
      );
    }

    const updatedProposal = await this.proposalRepository.save(proposal);

    return this.findOne(updatedProposal.publicId, currentUser, {
      relations: ['order.customer', 'provider', 'order.selectedProvider'],
    });
  }

  async remove(
    identifier: number | string,
    currentUser: AuthUserPayload,
  ): Promise<void> {
    const proposal = await this.findOne(identifier, currentUser, {
      relations: ['provider', 'order', 'order.customer'],
    });

    if (currentUser.role === UserRole.PROVIDER) {
      if (proposal.provider.publicId !== currentUser.providerPublicId) {
        throw new ForbiddenException('You can only delete your own proposals.');
      }
      if (proposal.status !== ProposalStatus.PENDING) {
        throw new BadRequestException(
          'Proposal can only be deleted in PENDING status.',
        );
      }
    } else if (currentUser.role !== UserRole.SUPPORT) {
      throw new ForbiddenException(
        'You are not authorized to delete this proposal.',
      );
    }

    await this.proposalRepository.delete({ id: proposal.id });
  }

  private async handleProposalStatusUpdate(
    proposal: Proposal,
    newStatus: ProposalStatus,
    currentUser: AuthUserPayload,
  ) {
    const isCustomer = currentUser.role === UserRole.CUSTOMER;
    const isProvider = currentUser.role === UserRole.PROVIDER;
    const isSupport = currentUser.role === UserRole.SUPPORT;

    switch (newStatus) {
      case ProposalStatus.ACCEPTED:
        if (!isCustomer && !isSupport) {
          throw new ForbiddenException(
            'Only a customer or supporter can accept a proposal.',
          );
        }
        if (proposal.status !== ProposalStatus.PENDING) {
          throw new BadRequestException(
            `Cannot accept a proposal with status "${proposal.status}".`,
          );
        }
        if (proposal.order.status !== OrderStatus.PENDING_PROPOSALS) {
          throw new BadRequestException(
            `Cannot accept a proposal for an order with status "${proposal.order.status}".`,
          );
        }

        await this.proposalRepository.manager.transaction(async (manager) => {
          proposal.status = ProposalStatus.ACCEPTED;
          await manager.save(proposal);

          const orderToUpdate = proposal.order;
          orderToUpdate.status = OrderStatus.IN_PROGRESS;
          orderToUpdate.selectedProvider = proposal.provider;
          await manager.save(orderToUpdate);

          await manager.update(
            Proposal,
            {
              order: { id: orderToUpdate.id },
              status: ProposalStatus.PENDING,
              publicId: Not(proposal.publicId),
            },
            { status: ProposalStatus.REJECTED },
          );
        });
        break;

      case ProposalStatus.REJECTED:
        if (!isCustomer && !isSupport) {
          throw new ForbiddenException(
            'Only a customer or supporter can reject a proposal.',
          );
        }
        if (proposal.status !== ProposalStatus.PENDING) {
          throw new BadRequestException(
            `Cannot reject a proposal with status "${proposal.status}".`,
          );
        }
        proposal.status = newStatus;
        break;

      case ProposalStatus.WITHDRAWN:
        if (!isProvider && !isSupport) {
          throw new ForbiddenException(
            'Only a provider or supporter can withdraw a proposal.',
          );
        }
        if (proposal.status !== ProposalStatus.PENDING) {
          throw new BadRequestException(
            `Cannot withdraw a proposal with status "${proposal.status}".`,
          );
        }
        proposal.status = newStatus;
        break;

      default:
        throw new BadRequestException(
          `Invalid status transition to ${newStatus}.`,
        );
    }
  }
}
