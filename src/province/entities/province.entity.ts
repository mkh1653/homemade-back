import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { City } from 'src/city/entities/city.entity';

@Entity()
export class Province {
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
  name: string;

  @OneToMany(() => City, (city) => city.province)
  cities: City[];
}
