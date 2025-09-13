import { Injectable } from '@nestjs/common';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { FindOneOptions, Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async create(createProvinceDto: CreateProvinceDto): Promise<Province> {
    const newProvince = this.provinceRepository.create(createProvinceDto);

    return await this.provinceRepository.save(newProvince);
  }

  async findAll(): Promise<Province[]> {
    return await this.provinceRepository.find({
      relations: ['cities']
    });
  }

  async findOne(identifier: number | string): Promise<Province> {
    let whereCondition: FindOneOptions<Province>['where'];

    if (typeof identifier === 'string') {
      whereCondition = { publicId: identifier };
    } else {
      whereCondition = { id: identifier };
    }

    const province = await this.provinceRepository.findOne({
      where: whereCondition,
    });
    return province;
  }

  async update(
    identifier: number | string,
    updateProvinceDto: UpdateProvinceDto,
  ): Promise<Province> {
    const province = await this.findOne(identifier);

    Object.assign(province, updateProvinceDto);
    return await this.provinceRepository.save(province);
  }

  async remove(identifier: number | string): Promise<void> {
    const province = await this.findOne(identifier);
    await this.provinceRepository.delete(province);
  }
}
