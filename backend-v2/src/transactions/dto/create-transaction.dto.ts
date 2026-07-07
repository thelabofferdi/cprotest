import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min } from 'class-validator';

export enum TransactionType {
  VENTE = 'VENTE',
  SERVICE = 'SERVICE',
  DEPENSE = 'DEPENSE',
  REVENU = 'REVENU',
  AUTRE_REVENU = 'AUTRE_REVENU',
}

export enum ModePaiement {
  CASH = 'CASH',
  MOMO = 'MOMO',
  BANQUE = 'BANQUE',
  CREDIT = 'CREDIT',
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0)
  montant: number;

  @IsString()
  categorie: string;

  @IsOptional()
  @IsString()
  sousCategorie?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantite?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prixUnitaire?: number;

  @IsEnum(ModePaiement)
  modePaiement: ModePaiement;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
