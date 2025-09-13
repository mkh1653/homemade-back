import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.create(createCustomerDto);
    return customer;
  }

  @Get()
  async findAll(
    @Query('relations') relations?: string,
  ): Promise<CustomerResponseDto[]> {
    let relationOptions = {};
    if (relations) {
      relationOptions = { relations: relations.split(',') };
    }

    const customers = await this.customerService.findAll(relationOptions);
    return customers;
  }

  @Get(':publicId')
  async findOne(
    @Param('publicId') publicId: string,
    @Query('relations') relations?: string,
  ): Promise<CustomerResponseDto> {
    let relationOptions = {};
    if (relations) {
      relationOptions = { relations: relations.split(',') };
    }

    const customer = await this.customerService.findOne(publicId, relationOptions);
    return customer;
  }

  @Patch(':publicId')
  async update(
    @Param('publicId') publicId: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.update(publicId, updateCustomerDto);
    return customer;
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('publicId') publicId: string): Promise<void> {
    await this.customerService.remove(publicId);
  }
}
