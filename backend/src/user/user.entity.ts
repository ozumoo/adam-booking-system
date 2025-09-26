import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Painter } from '../painter/painter.entity';
import { Customer } from '../customer/customer.entity';
import { Availability } from '../availability/availability.entity';
import { Booking } from '../booking/booking.entity';

export enum UserRole {
  PAINTER = 'painter',
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Profile relationships
  @OneToOne(() => Painter, painter => painter.user)
  painterProfile?: Painter;

  @OneToOne(() => Customer, customer => customer.user)
  customerProfile?: Customer;

  // Direct relationships for easier querying
  @OneToMany(() => Availability, availability => availability.painter)
  availabilities?: Availability[];

  @OneToMany(() => Booking, booking => booking.painter)
  painterBookings?: Booking[];

  @OneToMany(() => Booking, booking => booking.customer)
  customerBookings?: Booking[];
}
