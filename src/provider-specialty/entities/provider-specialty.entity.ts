import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';

import { Provider } from 'src/provider/entities/provider.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';

@Entity()
export class ProviderSpecialty {
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
  
  @Column({ type: 'int', nullable: true })
  experienceYears?: number;

  @ManyToOne(() => Provider, (provider) => provider.providerSpecialties, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Specialty, (specialty) => specialty.providerSpecialties, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
