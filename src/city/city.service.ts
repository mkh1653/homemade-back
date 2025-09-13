import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { FindManyOptions, FindOneOptions, Like, Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProvinceService } from 'src/province/province.service';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly provinceService: ProvinceService,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    const { provinceId, ...cityData } = createCityDto;
    const province = await this.provinceService.findOne(provinceId);

    const city = this.cityRepository.create({
      ...cityData,
      province,
    });

    return this.cityRepository.save(city);
  }

  async findAll(
    options?: FindManyOptions<City>,
    name?: string,
  ): Promise<City[]> {
    const mergedOptions: FindManyOptions<City> = {
      ...options,
      relations: {
        ...options?.relations,
        province: true,
      },
      where: {
        ...options.where,
        name: name ? Like(`%${name}%`) : undefined,
      },
    };

    return this.cityRepository.find(mergedOptions);
  }

  async findOne(identifier: number | string): Promise<City> {
    let whereCondition: FindOneOptions<City>['where'];

    if (typeof identifier === 'string') {
      whereCondition = { publicId: identifier };
    } else {
      whereCondition = { id: identifier };
    }

    const city = await this.cityRepository.findOneBy(whereCondition);

    if (!city) {
      throw new NotFoundException(`City with ID ${identifier} Not Found`);
    }
    return city;
  }

  async update(
    identifier: number | string,
    updateCityDto: UpdateCityDto,
  ): Promise<City> {
    const city = await this.findOne(identifier);

    Object.assign(city, updateCityDto);
    return this.cityRepository.save(city);
  }

  async remove(identifier: number | string): Promise<void> {
    const city = await this.findOne(identifier);
    await this.cityRepository.delete(city);
  }
}
