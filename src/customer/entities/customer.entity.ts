import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

import { Person } from 'src/person/entities/person.entity';
import { Order } from 'src/order/entities/order.entity';
import { Expose } from 'class-transformer';
import { Review } from 'src/review/entities/review.entity';

@Entity()
export class Customer {
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

  @ManyToOne(() => Person, (person) => person.customers)
  person: Person;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Review, review => review.customer)
  reviews: Review[];

  @Expose()
  get fullName(): string {
    return this.person
      ? `${this.person.firstName || ''} ${this.person.lastName || ''}`.trim()
      : null;
  }
}
