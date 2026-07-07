import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export * from './create-transaction.dto';
export * from './sync-transactions.dto';
export * from './query-transactions.dto';
