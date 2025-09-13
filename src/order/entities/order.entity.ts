import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { OrderStatus } from 'src/common/enums/order-status.entity';
import { Review } from 'src/review/entities/review.entity';

@Entity()
export class Order {
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

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  budget: number;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PROPOSALS,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: false })
  customer: Customer;

  @ManyToOne(() => Provider, (provider) => provider.selectedOrders, {
    nullable: true,
  })
  @JoinColumn({ name: 'selected_provider_id' })
  selectedProvider?: Provider;

  @OneToMany(() => Proposal, (proposal) => proposal.order)
  proposals: Proposal[];

  @ManyToOne(() => Specialty, (speciality) => speciality.orders)
  specialty: Specialty;

  @OneToOne(() => Review, (review) => review.order)
  review: Review;
}
