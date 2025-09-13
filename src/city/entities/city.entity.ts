import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Province } from 'src/province/entities/province.entity';

@Entity()
export class City {
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

  @Column({unique: true})
  name: string;

  @ManyToOne(() => Province, (province) => province.cities)
  province: Province;
}
