import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import {
  Chain,
  Currency,
  CurrencyType,
  PaymentOrigin,
  Status,
  Transaction as Txn,
} from '@prisma/client';

@ObjectType()
export class Transaction {
  @Field(() => String)
  id: Txn['id'];

  @Field(() => String, { nullable: true })
  fiatTransactioId: Txn['fiatTransactionId'];

  @Field(() => String, { nullable: true })
  txnHash: Txn['txnHash'];
  
  @Field(() => String)
  status: Txn['status'];

  @Field(() => String, { nullable: true })
  chain?: Chain;

  @Field(() => String, { nullable: true })
  from?: PaymentOrigin;

  @Field(() => String, { nullable: true })
  gas?: string;

  @Field(() => Float)
  FIAT: number;

  @Field(() => String)
  currency: Currency;

  @Field(() => String)
  currencyType: CurrencyType;

  @Field(() => String)
  receiverVPA: string;

  @Field(() => String)
  payerId: Txn['payerId'];

  @Field(() => String)
  receiverAddress: string;
}
