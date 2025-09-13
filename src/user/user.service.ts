import { Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPassword } from './entities/user-password.entity';
import * as bcrypt from 'bcrypt';
import { Person } from 'src/person/entities/person.entity';
import { PersonService } from 'src/person/person.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserPassword)
    private readonly userPasswordRepository: Repository<UserPassword>,
  ) {}

  async findOne(identifier: string | number): Promise<User> {
    let whereCondition: FindOneOptions<User>['where'];
    if (typeof identifier === 'number') {
      whereCondition = { id: identifier };
    } else {
      whereCondition = { publicId: identifier };
    }

    const user = await this.userRepository.findOne({
      where: whereCondition,
      relations: ['person', 'userPassword'],
    });

    return user;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person')
      .leftJoinAndSelect('user.userPassword', 'userPassword')
      .where('person.email = :email', { email })
      .getOne();

    return user;
  }

  async findOneByPhone(phone: string): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person')
      .where('person.phone = :phone', { phone })
      .getOne();

    return user;
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async createUserWithPassword(
    person: Person,
    password: string,
  ): Promise<User> {
    const newUser = this.userRepository.create({ person });
    const user = await this.userRepository.save(newUser);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserPassword = this.userPasswordRepository.create({
      hash: hashedPassword,
      user,
    });
    await this.userPasswordRepository.save(newUserPassword);

    return user;
  }

  async createUser(person: Person): Promise<User> {
    const newUser = this.userRepository.create({ person });
    return this.userRepository.save(newUser);
  }

  async findAll(options?: FindManyOptions<User>): Promise<User []> {
    return await this.userRepository.find(options);
  }

  async updateUserStatus(
    identifier: number | string,
    isActive: boolean,
  ): Promise<User> {
    const user = await this.findOne(identifier);
    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async changePassword(
    identifier: number | string,
    newPassword: string,
  ): Promise<UserPassword> {
    const user = await this.findOne(identifier);

    if (!user || !user.userPassword) {
      throw new NotFoundException(`User or password record not found.`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.userPassword.hash = hashedPassword;

    return this.userPasswordRepository.save(user.userPassword);
  }
}
