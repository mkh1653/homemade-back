import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

import { Order } from 'src/order/entities/order.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { Customer } from 'src/customer/entities/customer.entity';

@Entity()
export class Review {
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

  @Column({ type: 'int', nullable: false, default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @OneToOne(() => Order, (order) => order.review, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  order: Order;

  @ManyToOne(() => Customer, (customer) => customer.reviews)
  customer: Customer;

  @ManyToOne(() => Provider, (provider) => provider.reviews)
  provider: Provider;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
