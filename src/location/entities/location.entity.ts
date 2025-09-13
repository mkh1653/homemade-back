import {
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Province } from 'src/province/entities/province.entity';
import { City } from 'src/city/entities/city.entity';

@Entity()
export class Location {
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
  lat: string;

  @Column()
  long: string;

  @Column()
  address: string;

  @OneToOne(() => Province)
  @JoinColumn()
  province: Province;

  @OneToOne(() => City)
  @JoinColumn()
  city: Province;
}
