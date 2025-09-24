import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Availability } from '../availability/availability.entity';
import { Booking } from '../booking/booking.entity';

@Entity('painters')
export class Painter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'varchar', length: 255 })
  specialization: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Availability, availability => availability.painter)
  availabilities: Availability[];

  @OneToMany(() => Booking, booking => booking.painter)
  bookings: Booking[];
}
