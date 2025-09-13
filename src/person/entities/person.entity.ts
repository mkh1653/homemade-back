import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { Location } from 'src/location/entities/location.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Supporter } from 'src/supporter/entities/supporter.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Person {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  @Index({ unique: true })
  publicId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  nationalityCode?: string;

  @Column({ nullable: true, unique: true })
  email?: string | null;

  @Column({ nullable: true })
  avatar?: string | null;

  @Column({ nullable: true, type: 'date' })
  birthday?: Date | null;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Location, { nullable: true })
  @JoinColumn()
  location?: Location | null;

  @OneToOne(() => User, (user) => user.person)
  user: User;

  @OneToMany(() => Customer, (customer) => customer.person, { nullable: true })
  customers?: Customer[];

  @OneToMany(() => Provider, (provider) => provider.person, { nullable: true })
  providers?: Provider[];

  @OneToMany(() => Supporter, (supporter) => supporter.person, {
    nullable: true,
  })
  supporters?: Supporter[];
}
