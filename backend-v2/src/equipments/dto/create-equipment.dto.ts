import { IsString, IsNumber, IsInt, IsDateString, Min } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  nom: string;

  @IsString()
  typeSlug: string;

  @IsNumber()
  @Min(0)
  valeurAchat: number;

  @IsInt()
  @Min(1)
  dureeVieAns: number;

  @IsDateString()
  dateAchat: string;
}
