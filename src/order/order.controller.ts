import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUserPayload } from 'src/common/interfaces/auth-user-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(UserRole.CUSTOMER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.create(createOrderDto, user);
    return order;
  }

  @Get(':publicId')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.SUPPORT)
  async findOne(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.findOne(publicId, user);
    return order;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.SUPPORT)
  async findAll(
    @CurrentUser() user: AuthUserPayload,
    @Query() queryParams: any,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.orderService.findAll(queryParams, user);
    return orders;
  }

  @Patch(':publicId')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.SUPPORT)
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<OrderResponseDto> {
    const updatedOrder = await this.orderService.update(
      publicId,
      updateOrderDto,
      user,
    );
    return updatedOrder;
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.CUSTOMER, UserRole.SUPPORT)
  async remove(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @CurrentUser() user: AuthUserPayload,
  ): Promise<void> {
    await this.orderService.remove(publicId, user);
  }
}
