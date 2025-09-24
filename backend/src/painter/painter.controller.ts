import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { PainterService } from './painter.service';
import { CreatePainterDto } from './dto/create-painter.dto';
import { UpdatePainterDto } from './dto/update-painter.dto';

@Controller('painters')
export class PainterController {
  constructor(private readonly painterService: PainterService) {}

  @Post()
  create(@Body() createPainterDto: CreatePainterDto) {
    return this.painterService.create(createPainterDto);
  }

  @Get()
  findAll(@Query('specialization') specialization?: string) {
    if (specialization) {
      return this.painterService.findBySpecialization(specialization);
    }
    return this.painterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.painterService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePainterDto: UpdatePainterDto) {
    return this.painterService.update(id, updatePainterDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.painterService.remove(id);
  }
}
