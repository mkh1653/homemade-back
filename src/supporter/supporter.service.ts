import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupporterDto } from './dto/create-supporter.dto';
import { UpdateSupporterDto } from './dto/update-supporter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Supporter } from './entities/supporter.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { PersonService } from 'src/person/person.service';
import { Person } from 'src/person/entities/person.entity';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class SupporterService {
  constructor(
    @InjectRepository(Supporter)
    private readonly supporterRepository: Repository<Supporter>,
    private readonly personService: PersonService,
  ) {}

  async create(createSupporterDto: CreateSupporterDto): Promise<Supporter> {
    const { email, password, ...creatDto } = createSupporterDto;
    if (!email) {
      throw new BadRequestException(
        'Email is required for Supporter registration.',
      );
    }

    let person: Person;
    person = await this.personService.findByPhone(creatDto.person.phone);

    if (!person) {
      const personWithEmail = { ...creatDto.person, email };
      person = await this.personService.create(personWithEmail, UserRole.SUPPORT, password);
    } else {
      if (person.email) {
        throw new BadRequestException(
          'A person with this email already exists.',
        );
      } else {
        person.email = email;
      }

      const existingSupporter = this.supporterRepository.findOne({
        where: { person: { id: person.id } },
      });
      if (existingSupporter) {
        throw new ConflictException(
          `A Supporter already exists for this person (phone: ${createSupporterDto.person.phone}).`,
        );
      }
    }

    const supporter = await this.supporterRepository.create(person);
    return await this.supporterRepository.save(supporter);
  }

  async findAll(options?: FindManyOptions<Supporter>): Promise<Supporter[]> {
    return await this.supporterRepository.find(options);
  }

  async findOne(
    identifier: number | string,
    options?: FindOneOptions<Supporter>,
  ): Promise<Supporter> {
    let whereCondition: FindOneOptions<Supporter>['where'];
    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }
    const supporter = await this.supporterRepository.findOne({
      where: whereCondition,
      ...options,
    });

    return supporter;
  }

  async update(
    identifier: number | string,
    updateSupporterDto: UpdateSupporterDto,
  ): Promise<Supporter> {
    const supporter = await this.findOne(identifier);

    if (!supporter) {
      throw new NotFoundException(
        `Supporter with ID or publicId ${identifier} not found`,
      );
    }

    Object.assign(supporter, updateSupporterDto);
    return await this.supporterRepository.save(supporter);
  }

  async remove(identifier: number | string): Promise<void> {
    const supporter = await this.findOne(identifier);
    if (!supporter) {
      throw new NotFoundException(
        `Supporter with ID or publicId ${identifier} not found`,
      );
    }

    const result = await this.supporterRepository.delete(supporter);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Supporter with ID or publicId ${identifier} not found.`,
      );
    }
  }
}
