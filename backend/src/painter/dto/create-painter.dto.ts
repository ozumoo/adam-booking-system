import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength, Min, Max } from 'class-validator';

export class CreatePainterDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  specialization: string;
}
