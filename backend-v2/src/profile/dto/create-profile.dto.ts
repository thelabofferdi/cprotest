import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export enum ModeFinancement {
  PROPRE = 'PROPRE',
  EMPRUNT = 'EMPRUNT',
  MIXTE = 'MIXTE',
}

export class CreateProfileDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  telephoneMomo?: string;

  @IsString()
  metierSlug: string;

  @IsString()
  lieu: string;

  @IsNumber()
  @Min(0)
  capitalDepart: number;

  @IsEnum(ModeFinancement)
  modeFinancement: ModeFinancement;

  @IsOptional()
  @IsString()
  devise?: string = 'XOF';

  @IsOptional()
  @IsNumber()
  @Min(0)
  objectifCaMensuel?: number;
}
