import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_password')
export class UserPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 255 })
  hash: string; // رمز عبور هش‌شده
  
  @Column({ type: 'timestamptz', nullable: true })
  lastPasswordChange?: Date;

  @OneToOne(() => User, (user) => user.userPassword, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}