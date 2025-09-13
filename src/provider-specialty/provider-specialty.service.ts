import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SpecialtyService } from 'src/specialty/specialty.service';
import { ProviderSpecialty } from './entities/provider-specialty.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProviderSpecialtyDto } from './dto/create-provider-specialty.dto';
import { UpdateProviderSpecialtyDto } from './dto/update-provider-specialty.dto';
import { Provider } from 'src/provider/entities/provider.entity';

@Injectable()
export class ProviderSpecialtyService {
  constructor(
    @InjectRepository(ProviderSpecialty)
    private readonly repo: Repository<ProviderSpecialty>,
    private readonly specialtyService: SpecialtyService,
  ) {}

  async addOrUpdateSpecialtiesForProvider(
    provider: Provider,
    specialtiesDto: (CreateProviderSpecialtyDto | UpdateProviderSpecialtyDto)[],
    existingProviderSpecialties: ProviderSpecialty[] = [],
  ): Promise<void> {
    for (const psDto of specialtiesDto) {
      const specialty = await this.specialtyService.findOne(
        psDto.specialtyPublicId,
      );
      if (!specialty) {
        throw new BadRequestException(
          `Specialty with publicId ${psDto.specialtyPublicId} not found.`,
        );
      }

      let providerSpecialty: ProviderSpecialty;

      const foundExisting = existingProviderSpecialties.find(
        (existing) => existing.specialty.publicId === psDto.specialtyPublicId,
      );

      if (foundExisting) {
        providerSpecialty = foundExisting;
      } else {
        providerSpecialty = this.repo.create({
          provider: provider,
          specialty: specialty,
        });
      }

      if (psDto.experienceYears !== undefined) {
        providerSpecialty.experienceYears = psDto.experienceYears;
      }

      await this.repo.save(providerSpecialty);
    }
  }

  async findSpecialtiesProvider(
    providerId: number,
  ): Promise<ProviderSpecialty[]> {
    const providerSpecialty = await this.repo.find({
      where: { provider: { id: providerId } },
      relations: ['specialty'],
    });

    if (!providerSpecialty) {
      throw new NotFoundException(
        `Provider with ID ${providerId} dont has any specialty`,
      );
    }

    return providerSpecialty;
  }

  async remove(item: ProviderSpecialty): Promise<void> {
    const result = await this.repo.delete(item);
    if (result.affected === 0) {
      throw new NotFoundException(`ProviderSpecialty not found`);
    }
  }
}
