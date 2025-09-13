import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/role.enum';
import { ReviewService } from './review.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReviewResponseDto } from './dto/review-response.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthUserPayload } from 'src/common/interfaces/auth-user-payload.interface';
import { Review } from './entities/review.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.CUSTOMER)
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.create(createReviewDto, user);
    return review;
  }

  @Get(':publicId')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.SUPPORT)
  async findOne(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<Review> {
    const review = await this.reviewService.findOne(publicId, user);
    return review;
  }

  @Roles(UserRole.SUPPORT, UserRole.CUSTOMER)
  @Patch(':publicId')
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() updateRevieDto: UpdateReviewDto,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<Review> {
    return await this.reviewService.update(publicId, updateRevieDto, user);
  }
}
