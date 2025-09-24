import { Injectable, NotFoundException } from '@nestjs/common';
import { PainterRepository } from './painter.repository';
import { CreatePainterDto } from './dto/create-painter.dto';
import { UpdatePainterDto } from './dto/update-painter.dto';
import { Painter } from './painter.entity';

@Injectable()
export class PainterService {
  constructor(private readonly painterRepository: PainterRepository) {}

  async create(createPainterDto: CreatePainterDto): Promise<Painter> {
    return this.painterRepository.create(createPainterDto);
  }

  async findAll(): Promise<Painter[]> {
    return this.painterRepository.findAll();
  }

  async findOne(id: number): Promise<Painter> {
    const painter = await this.painterRepository.findById(id);
    if (!painter) {
      throw new NotFoundException(`Painter with ID ${id} not found`);
    }
    return painter;
  }

  async update(id: number, updatePainterDto: UpdatePainterDto): Promise<Painter> {
    await this.findOne(id); // This will throw NotFoundException if painter doesn't exist
    return this.painterRepository.update(id, updatePainterDto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // This will throw NotFoundException if painter doesn't exist
    await this.painterRepository.delete(id);
  }

  async findBySpecialization(specialization: string): Promise<Painter[]> {
    return this.painterRepository.findBySpecialization(specialization);
  }
}
