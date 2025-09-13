import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { OrderService } from 'src/order/order.service';
import { OrderStatus } from 'src/common/enums/order-status.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UserRole } from 'src/common/enums/role.enum';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthUserPayload } from 'src/common/interfaces/auth-user-payload.interface';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly orderService: OrderService,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    currentUser: AuthUserPayload,
  ): Promise<Review> {
    if (currentUser.role !== UserRole.CUSTOMER) {
      throw new UnauthorizedException('Only customers can create reviews.');
    }

    const { orderPublicId, rating, comment } = createReviewDto;
    const order = await this.orderService.findOne(orderPublicId, currentUser, {
      relations: ['customer', 'selectedProvider', 'review'],
    });

    if (order.customer.publicId !== currentUser.customerPublicId) {
      throw new ForbiddenException(
        'You are not authorized to review this order as you are not the owner.',
      );
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        `Reviews can only be submitted for completed orders. Current status: ${order.status}`,
      );
    }

    if (order.review) {
      throw new BadRequestException(
        `A review already exists for Order with Public ID "${orderPublicId}".`,
      );
    }

    if (!order.selectedProvider) {
      throw new BadRequestException(
        'Cannot review an order without a selected provider.',
      );
    }

    const customer = order.customer;
    const provider = order.selectedProvider;

    const newReview = this.reviewRepository.create({
      rating,
      comment,
      order: order,
      customer,
      provider
    });
    const savedReview = await this.reviewRepository.save(newReview);

    const loadedReview = await this.reviewRepository.findOne({
      where: { id: savedReview.id },
      relations: [
        'order',
        'order.customer',
        'order.customer.person',
        'order.selectedProvider',
        'order.selectedProvider.person',
      ],
    });
    return loadedReview;
  }

  async findOne(
    identifier: string | number,
    currentUser: AuthUserPayload,
    relations: string[] = [],
  ): Promise<Review> {
    const defaultRelations = [
      'order',
      'order.customer',
      'order.customer.person',
      'order.selectedProvider',
      'order.selectedProvider.person',
    ];

    const finalRelations = [...new Set([...defaultRelations, ...relations])];

    let whereCondition: FindOneOptions<Review>['where'];
    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }

    const review = await this.reviewRepository.findOne({
      where: whereCondition,
      relations: finalRelations,
    });

    if (!review) {
      throw new NotFoundException(
        `Review with PublicId or ID "${identifier}" not found.`,
      );
    }

    switch (currentUser.role) {
      case UserRole.CUSTOMER:
        // Customer can only see their own review (i.e., review for their order)
        if (review.order.customer.publicId !== currentUser?.customerPublicId) {
          throw new ForbiddenException(
            'You are not authorized to view this review.',
          );
        }
        break;
      case UserRole.PROVIDER:
        // Provider can only see reviews received by them
        if (
          review.order.selectedProvider?.publicId !==
          currentUser?.providerPublicId
        ) {
          throw new ForbiddenException(
            'You are not authorized to view this review.',
          );
        }
        break;
      case UserRole.SUPPORT:
        // Supporter can see any review
        break;
      default:
        throw new UnauthorizedException('Invalid user role.');
    }

    return review;
  }

  async findAll(
    currentUser: AuthUserPayload,
    filterOptions?: {
      orderPublicId?: string;
      customerPublicId?: string;
      providerPublicId?: string;
      ratingMin?: number;
      ratingMax?: number;
      relations?: string[];
    },
  ): Promise<Review[]> {
    const queryBuilder = this.reviewRepository.createQueryBuilder('review');

    queryBuilder
      .leftJoinAndSelect('review.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.person', 'customerPerson')
      .leftJoinAndSelect('order.selectedProvider', 'provider')
      .leftJoinAndSelect('provider.person', 'providerPerson');

    const joinedAliases = new Set([
      'review',
      'order',
      'customer',
      'customerPerson',
      'provider',
      'providerPerson',
    ]);

    if (filterOptions?.relations && filterOptions.relations.length > 0) {
      for (const relation of filterOptions.relations) {
        // Example: 'order.proposals', 'review.someOtherRelation'
        const parts = relation.split('.'); // ['order', 'proposals'] or ['review', 'someOtherRelation']
        let previousAlias = 'review'; // Start with the root entity alias for the first part

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const fullPath = (i === 0 ? '' : previousAlias + '.') + part;
          const nextAlias = parts.slice(0, i + 1).join('_'); // Create a unique alias like 'order_proposals'

          if (!joinedAliases.has(nextAlias)) {
            // Only add join if not already joined
            queryBuilder.leftJoinAndSelect(fullPath, nextAlias);
            joinedAliases.add(nextAlias);
          }
          previousAlias = nextAlias;
        }
      }
    }

    switch (currentUser.role) {
      case UserRole.CUSTOMER:
        queryBuilder.andWhere('customer.publicId = :customerPublicId', {
          customerPublicId: currentUser.customerPublicId,
        });
        break;
      case UserRole.PROVIDER:
        queryBuilder.andWhere('provider.publicId = :providerPublicId', {
          providerPublicId: currentUser.providerPublicId,
        });
        break;
      case UserRole.SUPPORT:
        if (filterOptions?.customerPublicId) {
          queryBuilder.andWhere('customer.publicId = :filterCustomerPublicId', {
            filterCustomerPublicId: filterOptions.customerPublicId,
          });
        }
        if (filterOptions?.providerPublicId) {
          queryBuilder.andWhere('provider.publicId = :filterProviderPublicId', {
            filterProviderPublicId: filterOptions.providerPublicId,
          });
        }
        break;
      default:
        throw new UnauthorizedException(
          'Invalid user role for accessing reviews.',
        );
    }

    if (filterOptions?.orderPublicId) {
      queryBuilder.andWhere('order.publicId = :orderPublicId', {
        orderPublicId: filterOptions.orderPublicId,
      });
    }
    if (filterOptions?.ratingMin !== undefined) {
      queryBuilder.andWhere('review.rating >= :ratingMin', {
        ratingMin: filterOptions.ratingMin,
      });
    }
    if (filterOptions?.ratingMax !== undefined) {
      queryBuilder.andWhere('review.rating <= :ratingMax', {
        ratingMax: filterOptions.ratingMax,
      });
    }

    const reviews = await queryBuilder.getMany();
    return reviews;
  }

  async update(
    reviewPublicId: string,
    updateReviewDto: UpdateReviewDto,
    currentUser: AuthUserPayload,
  ): Promise<Review> {
    const review = await this.findOne(reviewPublicId, currentUser);

    if (currentUser.role === UserRole.CUSTOMER) {
      if (review.order.customer.publicId !== currentUser.customerPublicId) {
        throw new ForbiddenException(
          'You are not authorized to update this review.',
        );
      }
      // TODO: Optionally add time limit for review updates here if needed.
      // E.g., if (new Date().getTime() - review.createdAt.getTime() > MAX_UPDATE_TIME_MS) { ... }
    } else if (currentUser.role === UserRole.PROVIDER) {
      throw new UnauthorizedException(
        'Only customers or supporters can update reviews.',
      );
    }

    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }
    if (updateReviewDto.comment !== undefined) {
      review.comment = updateReviewDto.comment;
    }

    const updatedReview = await this.reviewRepository.save(review);
    return updatedReview;
  }

  async remove(
    reviewPublicId: string,
    currentUser: AuthUserPayload,
  ): Promise<void> {
    const review = await this.findOne(reviewPublicId, currentUser);

    if (currentUser.role === UserRole.CUSTOMER) {
      if (review.order.customer.publicId !== currentUser.customerPublicId) {
        throw new ForbiddenException(
          'You are not authorized to delete this review.',
        );
      }
    } else if (currentUser.role === UserRole.PROVIDER) {
      throw new UnauthorizedException(
        'Only customers or supporters can delete reviews.',
      );
    }

    await this.reviewRepository.remove(review);
  }
}
