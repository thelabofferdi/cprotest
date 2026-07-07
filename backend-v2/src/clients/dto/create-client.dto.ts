import { IsString, IsOptional, IsNumber, IsEmail, Min } from 'class-validator';

export class CreateClientDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  soldeCredit?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  limitCredit?: number;
}
