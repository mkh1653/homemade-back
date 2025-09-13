import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { ProviderSpecialty } from 'src/provider-specialty/entities/provider-specialty.entity';
import { Order } from 'src/order/entities/order.entity';

@Entity()
export class Specialty {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  @Index({ unique: true })
  publicId: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  name: string;

  @Column({ type: 'text'})
  description: string;

  @Column({ nullable: true })
  icon?: string;
  
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  @OneToMany(() => ProviderSpecialty, (ps) => ps.specialty)
  providerSpecialties: ProviderSpecialty[];

  @OneToMany(() => Order, (order) => order.specialty)
  orders: Order [];
}
