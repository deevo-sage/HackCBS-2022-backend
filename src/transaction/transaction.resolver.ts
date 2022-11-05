import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Mutation(() => Transaction)
  createTransaction(
    @Args('createTransactionInput')
    createTransactionInput: CreateTransactionInput,
  ) {
    return this.transactionService.create(createTransactionInput as any);
  }

  @Query(() => [Transaction], { name: 'transactions' })
  findAll() {
    return this.transactionService.findAll();
  }

  @Query(() => Transaction, { name: 'transaction' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.transactionService.StatusCheck(id);
  }
  @Mutation(() => Transaction, { name: 'transact' })
  transact(
    @Args('from', { type: () => String }) from: string,
    @Args('currency', { type: () => String }) currency: string,
    @Args('amount', { type: () => Int }) amount: number,
    @Args('to', { type: () => String }) to: string,
  ) {
    this.transactionService.initiateDebitFromVault(from, currency, amount, to);
  }
}
