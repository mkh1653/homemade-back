import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialty } from './entities/specialty.entity';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtyService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
  ) {}

  async create(createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
    const existing = await this.specialtyRepository.findOne({
      where: { name: createSpecialtyDto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Specialty with name "${createSpecialtyDto.name}" already exists.`,
      );
    }

    const specialty = this.specialtyRepository.create(createSpecialtyDto);
    const savedSpecialty = await this.specialtyRepository.save(specialty);
    return savedSpecialty;
  }

  async update(
    identifier: string | number,
    updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<Specialty> {
    const specialty = await this.findOne(identifier);

    if (updateSpecialtyDto.name && updateSpecialtyDto.name !== specialty.name) {
      const existing = await this.specialtyRepository.findOne({
        where: { name: updateSpecialtyDto.name },
      });

      if (existing && existing.id !== specialty.id) {
        throw new ConflictException(
          `Specialty with name "${updateSpecialtyDto.name}" already exists.`,
        );
      }
    }

    Object.assign(specialty, updateSpecialtyDto);

    return await this.specialtyRepository.save(specialty);
  }

  async findAll(options?: {
    relations?: FindManyOptions<Specialty>['relations'];
    isActive?: boolean;
  }): Promise<Specialty[]> {
    const where: any = {};
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const specialties = await this.specialtyRepository.find({
      where: where,
      relations: options?.relations,
    });

    return specialties;
  }

  async findOne(
    identifier: string | number,
    options?: FindOneOptions<Specialty>,
  ): Promise<Specialty> {
    let whereCondition: FindOneOptions<Specialty>['where'];
    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }

    const specialty = await this.specialtyRepository.findOne({
      where: whereCondition,
      ...options,
    });

    if (!specialty) {
      throw new NotFoundException(
        `Specialty with ID or publicId "${identifier}" not found.`,
      );
    }

    return specialty;
  }

  async remove(identifier: string | number): Promise<void> {
    const specialty = await this.findOne(identifier, {
      relations: ['providerSpecialties', 'orders'],
    });

    if (
      specialty.providerSpecialties &&
      specialty.providerSpecialties.length > 0
    ) {
      throw new BadRequestException(
        `This Specialty cannot be removed because it is linked to existing provider specialties.`,
      );
    }

    if (specialty.orders && specialty.orders.length > 0) {
      throw new BadRequestException(
        `This Specialty cannot be removed because it is linked to existing orders.`,
      );
    }

    await this.specialtyRepository.remove(specialty)
  }
}
