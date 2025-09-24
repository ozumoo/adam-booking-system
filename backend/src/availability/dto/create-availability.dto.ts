import { IsNotEmpty, IsEnum, IsString, IsNumber } from 'class-validator';
import { DayOfWeek } from '../availability.entity';

export class CreateAvailabilityDto {
  @IsNotEmpty()
  @IsNumber()
  painterId: number;

  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;
}
