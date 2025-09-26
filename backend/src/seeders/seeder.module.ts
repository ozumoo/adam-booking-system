import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimpleSeederService } from './simple-seeder.service';
import { User } from '../user/user.entity';
import { Customer } from '../customer/customer.entity';
import { Painter } from '../painter/painter.entity';
import { Availability } from '../availability/availability.entity';
import { Booking } from '../booking/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Customer, Painter, Availability, Booking]),
  ],
  providers: [SimpleSeederService],
  exports: [SimpleSeederService],
})
export class SeederModule {}
