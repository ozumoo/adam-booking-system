import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { AvailabilityRepository } from './availability.repository';
import { Availability } from './availability.entity';
import { PainterModule } from '../painter/painter.module';

@Module({
  imports: [TypeOrmModule.forFeature([Availability]), PainterModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository],
  exports: [AvailabilityService, AvailabilityRepository],
})
export class AvailabilityModule {}
