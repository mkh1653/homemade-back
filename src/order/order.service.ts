import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CustomerService } from 'src/customer/customer.service';
import { OrderStatus } from 'src/common/enums/order-status.entity';
import { ProviderService } from 'src/provider/provider.service';
import { SpecialtyService } from 'src/specialty/specialty.service';
import { UserRole } from 'src/common/enums/role.enum';
import { AuthUserPayload } from 'src/common/interfaces/auth-user-payload.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly customerService: CustomerService,
    private readonly providerService: ProviderService,
    private readonly specialtyService: SpecialtyService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    currentUser: AuthUserPayload,
  ): Promise<Order> {
    if (currentUser.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Only customers can create new orders.');
    }
    const customer = await this.customerService.findOne(
      currentUser.customerPublicId,
    );

    const specialty = await this.specialtyService.findOne(
      createOrderDto.specialtyId,
    );

    const newOrder = this.orderRepository.create({
      title: createOrderDto.title,
      description: createOrderDto.description,
      budget: createOrderDto.budget,
      deadline: createOrderDto.deadline,
      specialty,
      customer,
      status: OrderStatus.PENDING_PROPOSALS,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    const loadedOrder = await this.findOne(savedOrder.publicId, currentUser, {
      relations: ['customer.person', 'specialty'],
    });

    return loadedOrder;
  }

  async findAll(options: any, currentUser: AuthUserPayload): Promise<Order[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    queryBuilder.leftJoinAndSelect('order.customer', 'customer');
    queryBuilder.leftJoinAndSelect('order.specialty', 'specialty');
    queryBuilder.leftJoinAndSelect(
      'order.selectedProvider',
      'selectedProvider',
    );

    if (options.status) {
      queryBuilder.andWhere('order.status = :status', {
        status: options.status,
      });
    }

    if (currentUser.role === UserRole.CUSTOMER) {
      queryBuilder.andWhere('customer.publicId = :customerPublicId', {
        customerPublicId: currentUser.customerPublicId,
      });
      if (options.orderPublicId) {
        queryBuilder.andWhere('order.publicId = :orderPublicId', {
          orderPublicId: options.orderPublicId,
        });
      }
    } else if (currentUser.role === UserRole.PROVIDER) {
      const provider = await this.providerService.findOne(
        currentUser.providerPublicId,
        { relations: ['providerSpecialties'] },
      );
      const providerSpecialtyIds = provider.providerSpecialties.map(
        (s) => s.id,
      );
      queryBuilder
        .leftJoin('order.proposals', 'proposal')
        .andWhere(
          `(proposal.provider.publicId = :providerPublicId OR order.selectedProvider.publicId = :providerPublicId OR (order.status = :pendingStatus AND order.specialty.id IN (:...specialtyIds)))`,
          {
            providerPublicId: currentUser.providerPublicId,
            pendingStatus: OrderStatus.PENDING_PROPOSALS,
            specialtyIds: providerSpecialtyIds,
          },
        );
      if (
        options.providerPublicId &&
        options.providerPublicId !== currentUser.providerPublicId
      ) {
        throw new UnauthorizedException(
          'You can only query orders for your own provider ID or general public orders.',
        );
      }
    } else if (currentUser.role === UserRole.SUPPORT) {
      if (options.orderPublicId) {
        queryBuilder.andWhere('order.publicId = :orderPublicId', {
          orderPublicId: options.orderPublicId,
        });
      }
      if (options.providerPublicId) {
        queryBuilder.andWhere('selectedProvider.publicId = :providerPublicId', {
          providerPublicId: options.providerPublicId,
        });
      }
      if (options.customerPublicId) {
        queryBuilder.andWhere('customer.publicId = :customerPublicId', {
          customerPublicId: options.customerPublicId,
        });
      }
    }

    const orders = await queryBuilder.getMany();
    return orders;
  }

  async findOne(
    identifier: string | number,
    currentUser: AuthUserPayload,
    options?: FindOneOptions<Order>
  ): Promise<Order> {
    let whereCondition: FindOneOptions<Order>['where'];
    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }

    const order = await this.orderRepository.findOne({
      where: whereCondition,
      ...options,
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID or publicId ${identifier} not found`,
      );
    }

    const isCustomer =
      currentUser.role === UserRole.CUSTOMER &&
      order.customer.publicId === currentUser.customerPublicId;
    const isProvider =
      currentUser.role === UserRole.PROVIDER &&
      order.selectedProvider?.publicId === currentUser.providerPublicId;
    const isSupport = currentUser.role === UserRole.SUPPORT;

    if (!isCustomer && !isProvider && !isSupport) {
      throw new ForbiddenException(
        'You are not authorized to view this order.',
      );
    }

    return order;
  }

  async update(
    identifier: string,
    updateOrderDto: UpdateOrderDto,
    currentUser: AuthUserPayload,
  ): Promise<Order> {
    const order = await this.findOne(identifier, currentUser, {
      relations: ['customer', 'selectedProvider', 'specialty'],
    });

    const canUpdate =
      (currentUser.role === UserRole.CUSTOMER &&
        order.customer.publicId === currentUser.customerPublicId) ||
      (currentUser.role === UserRole.PROVIDER &&
        order.selectedProvider?.publicId === currentUser.providerPublicId) ||
      currentUser.role === UserRole.SUPPORT;

    if (!canUpdate) {
      throw new ForbiddenException(
        'You are not authorized to update this order.',
      );
    }

    if (updateOrderDto.status) {
      this.handleStatusUpdate(order, updateOrderDto.status, currentUser);
    }

    if (updateOrderDto.selectedProviderId) {
      await this.handleProviderSelection(
        order,
        updateOrderDto.selectedProviderId,
        currentUser,
      );
    }

    this.handleOrderDetailsUpdate(order, updateOrderDto, currentUser);

    await this.orderRepository.save(order);
    const updatedOrder = await this.findOne(order.publicId, currentUser, {
      relations: ['customer.person', 'specialty', 'selectedProvider.person'],
    });

    return updatedOrder;
  }

  async remove(
    identifier: string,
    currentUser: AuthUserPayload,
  ): Promise<void> {
    const order = await this.findOne(identifier, currentUser, {
      relations: ['customer'],
    });

    const isCustomer =
      currentUser.role === UserRole.CUSTOMER &&
      order.customer.publicId === currentUser.customerPublicId;
    const isSupport = currentUser.role === UserRole.SUPPORT;

    if (!isCustomer && !isSupport) {
      throw new UnauthorizedException(
        'You are not authorized to delete this order.',
      );
    }

    if (isCustomer) {
      if (
        order.status !== OrderStatus.PENDING_PROPOSALS &&
        order.status !== OrderStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'Orders can only be deleted by the customer if they are pending proposals or already cancelled.',
        );
      }
    }
    const result = await this.orderRepository.delete(order.id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Order with ID or publicId ${identifier} not found.`,
      );
    }
  }

  private handleStatusUpdate(
    order: Order,
    newStatus: OrderStatus,
    currentUser: AuthUserPayload,
  ) {
    if (newStatus === order.status) return;
    const isCustomer = currentUser.role === UserRole.CUSTOMER;
    const isProvider = currentUser.role === UserRole.PROVIDER;
    const isSupport = currentUser.role === UserRole.SUPPORT;

    if (isCustomer) {
      if (
        order.status === OrderStatus.PENDING_PROPOSALS &&
        newStatus === OrderStatus.CANCELLED
      ) {
        order.status = newStatus;
      } else {
        throw new BadRequestException(
          `Customer cannot change order status from ${order.status} to ${newStatus}.`,
        );
      }
    } else if (isProvider) {
      if (order.selectedProvider?.publicId !== currentUser.providerPublicId) {
        throw new UnauthorizedException(
          'You are not the selected provider for this order.',
        );
      }
      if (
        order.status === OrderStatus.IN_PROGRESS &&
        newStatus === OrderStatus.COMPLETED
      ) {
        order.status = newStatus;
      } else {
        throw new BadRequestException(
          `Provider cannot change order status from ${order.status} to ${newStatus}. Only IN_PROGRESS to DONE is allowed.`,
        );
      }
    } else if (isSupport) {
      if (!Object.values(OrderStatus).includes(newStatus)) {
        throw new BadRequestException('Invalid target status for order.');
      }
      order.status = newStatus;
    } else {
      throw new UnauthorizedException(
        'You are not authorized to change the status of this order.',
      );
    }
  }

  private async handleProviderSelection(
    order: Order,
    providerPublicId: string,
    currentUser: AuthUserPayload,
  ) {
    const isCustomer = currentUser.role === UserRole.CUSTOMER;
    const isSupport = currentUser.role === UserRole.SUPPORT;

    if (!isCustomer && !isSupport) {
      throw new UnauthorizedException(
        'Only a customer or supporter can select/change the provider.',
      );
    }

    if (isCustomer && order.status !== OrderStatus.PENDING_PROPOSALS) {
      throw new BadRequestException(
        'Customer can only select a provider when the order is in PENDING_PROPOSALS status.',
      );
    }

    const selectedProvider =
      await this.providerService.findOne(providerPublicId);

    order.selectedProvider = selectedProvider;
    if (order.status === OrderStatus.PENDING_PROPOSALS) {
      order.status = OrderStatus.ACCEPTED;
    }
  }

  private handleOrderDetailsUpdate(order: Order, updateOrderDto: UpdateOrderDto, currentUser: AuthUserPayload) {
    const isCustomer = currentUser.role === UserRole.CUSTOMER;
    const isProvider = currentUser.role === UserRole.PROVIDER;
    const isSupport = currentUser.role === UserRole.SUPPORT;
    
    if (isCustomer) {
      if (order.status !== OrderStatus.PENDING_PROPOSALS) {
        throw new BadRequestException('Order details (title, description, budget, deadline) can only be updated in PENDING_PROPOSALS status by the customer.');
      }
      Object.assign(order, {
        title: updateOrderDto.title,
        description: updateOrderDto.description,
        budget: updateOrderDto.budget,
        deadline: updateOrderDto.deadline,
      });
      if (updateOrderDto.specialtyId && updateOrderDto.specialtyId !== order.specialty.publicId) {
        throw new BadRequestException('Order specialty cannot be changed after creation.');
      }
    } else if (isSupport) {
        Object.assign(order, {
            title: updateOrderDto.title,
            description: updateOrderDto.description,
            budget: updateOrderDto.budget,
            deadline: updateOrderDto.deadline,
        });
        if (updateOrderDto.specialtyId && updateOrderDto.specialtyId !== order.specialty.publicId) {
            throw new BadRequestException('Order specialty cannot be changed after creation, even by a supporter.');
        }
    } else if (isProvider) {
      if (
        updateOrderDto.title || updateOrderDto.description || updateOrderDto.budget !== undefined ||
        updateOrderDto.deadline !== undefined || updateOrderDto.specialtyId
      ) {
        throw new UnauthorizedException('Providers are not authorized to update general order details.');
      }
    }
  }
}
