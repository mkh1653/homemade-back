import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Person } from 'src/person/entities/person.entity';
import { UserPassword } from './user-password.entity';

@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true, default: () => 'gen_random_uuid()' })
  publicId: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => UserPassword, (userPassword) => userPassword.user, {
    nullable: true,
  })
  userPassword?: UserPassword;
  
  @OneToOne(() => Person, (person) => person.user, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  person: Person;
}
