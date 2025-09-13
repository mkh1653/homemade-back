import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { PersonService } from 'src/person/person.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly personService: PersonService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    let person;

    person = await this.personService.findByPhone(
      createCustomerDto.person.phone,
    );
    if (!person) {
      person = await this.personService.create(createCustomerDto.person, UserRole.CUSTOMER);
    } else {
      const existingCustomer = await this.customerRepository.findOne({
        where: { person: { id: person.id } },
      });
      if (existingCustomer) {
        throw new ConflictException(
          `A customer already exists for this person (phone: ${createCustomerDto.person.phone}).`,
        );
      }
    }

    this.customerRepository.create(person);
    return await this.customerRepository.save(person);
  }

  async findAll(options?: FindManyOptions<Customer>): Promise<Customer[]> {
    return this.customerRepository.find(options);
  }

  async findOne(
    identifier: number | string,
    options?: FindOneOptions<Customer>,
  ): Promise<Customer> {
    let whereCondition: FindOneOptions<Customer>['where'];
    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }
    const customer = this.customerRepository.findOne({
      where: whereCondition,
      ...options,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(
    identifier: number | string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(identifier);

    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(identifier: number | string): Promise<void> {
    const result = await this.customerRepository.delete(identifier);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Customer with ID or publicId ${identifier} not found.`,
      );
    }
  }
}
