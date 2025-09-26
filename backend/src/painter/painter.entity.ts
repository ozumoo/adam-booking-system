import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Availability } from '../availability/availability.entity';
import { Booking } from '../booking/booking.entity';
import { User } from '../user/user.entity';

@Entity('painters')
export class Painter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'varchar', length: 255 })
  specialization: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Link to User entity
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Availability, availability => availability.painter)
  availabilities: Availability[];

  @OneToMany(() => Booking, booking => booking.painter)
  bookings: Booking[];
}
