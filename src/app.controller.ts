import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber } from 'ethers';
import { AppService } from './app.service';
import { getConversionRate } from './common/web3.utils';
import { PaymentService } from './payment/payment.service';
import { TransactionService } from './transaction/transaction.service';
import { Contract } from './web3/contract/contract';

@Controller()
export class AppController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
    private readonly configService: ConfigService,
  ) {}

  @Get('getContractAddress')
  getContractAddress(): string {
    return Contract.getInstance().getContractAddress();
  }

  @Get('/constants')
  getConstants() {
    const data = {
      contractAddress: Contract.getInstance().getContractAddress(),
      contractAbi: this.configService.get('CONTRACT_ABI'),
    };

    return data;
  }

  @Get('balance')
  async getBalance(): Promise<any> {
    return await Contract.getInstance().contractInstance.functions.getVaultBalance(
      '0xb91CC1FBCA90301807DF4B98f5A04f7Ce62a3806',
    );
  }

  @Post('/initiateDebit')
  async initiateDebit(
    @Body('from') from: string,
    @Body('currency') currency: string,
    @Body('amount') amount: number,
    @Body('to') to: string,
  ) {
    return await this.transactionService.initiateDebitFromVault(
      from,
      currency,
      amount,
      to,
    );
    // return { ...query, amount: parseInt(query.amount) };
  }
  // http://localhost:8000/initiateDebit?from=0xb91CC1FBCA90301807DF4B98f5A04f7Ce62a3806&currency=INR&amount=1000&to=hahaok@paytm
  @Get('/convert')
  async convert(@Query() query) {
    return await getConversionRate(query.crypto, query.fiat, query.amount);
  }

  @Get('/statusContract')
  statusCheckContract(@Query() query): Promise<any> {
    return this.transactionService.StatusCheck(query.id);
  }

  @Get('/statusFiat')
  statusCheckFiat(@Query() query): Promise<any> {
    return this.transactionService.StatusCheck(query.id);
  }

  @Get('getVaultBalance/:address')
  async getVaultBalance(@Param('address') address: string): Promise<any> {
    return await Contract.getInstance().getVaultBalance(address);
  }

  @Get('test')
  test() {
    return Contract.getInstance().payFromVaultViaUPI(
      '0xb91cc1fbca90301807df4b98f5a04f7ce62a3806',
      BigNumber.from('12344'),
    );
  }
}
