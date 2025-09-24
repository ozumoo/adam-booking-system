import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PainterService } from './painter.service';
import { PainterController } from './painter.controller';
import { PainterRepository } from './painter.repository';
import { Painter } from './painter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Painter])],
  controllers: [PainterController],
  providers: [PainterService, PainterRepository],
  exports: [PainterService, PainterRepository],
})
export class PainterModule {}
