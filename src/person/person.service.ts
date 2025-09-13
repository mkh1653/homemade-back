import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository, FindManyOptions } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person) private personRepository: Repository<Person>,
    private readonly userService: UserService,
  ) {}

  async create(
    createPersonDto: CreatePersonDto,
    role: UserRole,
    password?: string,
  ): Promise<Person> {
    const person = await this.personRepository.create(createPersonDto);
    await this.personRepository.save(person);
    if (role === UserRole.SUPPORT) {
      this.userService.createUserWithPassword(person, password);
    } else {
      this.userService.createUser(person);
    }

    return person 
  }

  async findOne(
    identifier: number | string,
    options?: FindOneOptions<Person>,
  ): Promise<Person> {
    let whereCondition: FindOneOptions<Person>['where'];

    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }
    const person = await this.personRepository.findOne({
      where: whereCondition,
      ...options,
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${identifier} not found`);
    }

    return person;
  }

  async findAll(options?: FindManyOptions<Person>): Promise<Person[]> {
    return this.personRepository.find(options);
  }

  async update(
    identifier: number | string,
    updatePersonDto: UpdatePersonDto,
  ): Promise<Person> {
    const person = await this.findOne(identifier);

    Object.assign(person, updatePersonDto);
    return this.personRepository.save(person);
  }

  async remove(identifier: number | string): Promise<Person> {
    const person = await this.findOne(identifier);

    person.isDeleted = true;
    return await this.personRepository.save(person);
  }

  async findByPhone(phone: string): Promise<Person> {
    const person = await this.personRepository.findOneBy({ phone });

    return person;
  }
}
