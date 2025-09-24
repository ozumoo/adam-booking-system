import { PartialType } from '@nestjs/mapped-types';
import { CreatePainterDto } from './create-painter.dto';

export class UpdatePainterDto extends PartialType(CreatePainterDto) {}
