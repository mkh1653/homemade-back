import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';

import { ProposalStatus } from 'src/common/enums/proposal-status.enum';
import { Provider } from 'src/provider/entities/provider.entity';
import { Order } from 'src/order/entities/order.entity';

@Entity()
@Unique(['order', 'provider'])
export class Proposal {
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

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.PENDING,
  })
  status: ProposalStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Provider, (provider) => provider.proposals)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Order, (order) => order.proposals)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
