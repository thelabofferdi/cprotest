import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpertRequestDto {
  @IsString()
  @MaxLength(80)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
