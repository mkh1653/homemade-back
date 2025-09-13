import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PersonService } from 'src/person/person.service';
import { Person } from 'src/person/entities/person.entity';
import { UpdateProviderSpecialtyDto } from 'src/provider-specialty/dto/update-provider-specialty.dto';
import { ProviderSpecialtyService } from 'src/provider-specialty/provider-specialty.service';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly personService: PersonService,
    private readonly providerSpecialtyService: ProviderSpecialtyService,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    let person: Person;
    // find or create Person
    person = await this.personService.findByPhone(
      createProviderDto.person.phone,
    );
    if (!person) {
      person = await this.personService.create(createProviderDto.person, UserRole.PROVIDER);
    } else {
      const existingProvider = await this.providerRepository.findOne({
        where: { person: { id: person.id } },
      });
      if (existingProvider) {
        throw new ConflictException(
          `A provider already exists for this person (phone: ${createProviderDto.person.phone}).`,
        );
      }
    }

    // create Provider
    const provider = await this.providerRepository.create({
      person,
      bio: createProviderDto.bio,
    });
    const savedProvider = await this.providerRepository.save(provider);

    // ProviderSpecialties handle
    if (
      createProviderDto.providerSpecialties &&
      createProviderDto.providerSpecialties.length > 0
    ) {
      await this.providerSpecialtyService.addOrUpdateSpecialtiesForProvider(
        savedProvider,
        createProviderDto.providerSpecialties,
      );
    }

    return await this.findOne(savedProvider.publicId, {
      relations: ['person', 'providerSpecialties.specialty'],
    });
  }

  async findAll(options?: FindManyOptions<Provider>): Promise<Provider[]> {
    return this.providerRepository.find(options);
  }

  async findOne(
    identifier: number | string,
    options?: FindOneOptions<Provider>,
  ) {
    let whereCondition: FindOneOptions<Provider>['where'];
    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }
    const provider = await this.providerRepository.findOne({
      where: whereCondition,
      ...options,
    });

    if (!provider) {
      throw new NotFoundException(
        `Provider with ID or publicId ${identifier} not found`,
      );
    }

    return provider;
  }

  async update(
    identifier: number | string,
    updateProviderDto: UpdateProviderDto,
  ): Promise<Provider> {
    const provider = await this.findOne(identifier);

    if (updateProviderDto.bio !== undefined) {
      provider.bio = updateProviderDto.bio;
    }

    if (updateProviderDto.providerSpecialties !== undefined) {
      const existingSpecialties =
        await this.providerSpecialtyService.findSpecialtiesProvider(
          provider.id,
        );

      const updatedSpecialtyMap = new Map<string, UpdateProviderSpecialtyDto>();
      updateProviderDto.providerSpecialties.forEach((psDto) =>
        updatedSpecialtyMap.set(psDto.specialtyPublicId, psDto),
      );

      for (const existingPs of existingSpecialties) {
        if (!updatedSpecialtyMap.has(existingPs.specialty.publicId)) {
          await this.providerSpecialtyService.remove(existingPs);
        }
      }

      await this.providerSpecialtyService.addOrUpdateSpecialtiesForProvider(
        provider,
        updateProviderDto.providerSpecialties,
        existingSpecialties,
      );
    }

    await this.providerRepository.save(provider);

    return this.findOne(provider.publicId, {
      relations: ['person', 'providerSpecialties.specialty'],
    });
  }

  async remove(identifier: number | string) {
    const provider = await this.findOne(identifier);
    const result = await this.providerRepository.delete(provider.id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Provider with ID or publicId ${identifier} not found.`,
      );
    }
  }
}
