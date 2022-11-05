import { TransactionReceipt } from '@ethersproject/abstract-provider';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Chain, CurrencyType, PaymentOrigin, Prisma, Status, Transaction } from '@prisma/client';
import { ethers } from 'ethers';
import { alchemyProvider, getConversionRate } from 'src/common/web3.utils';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Contract } from 'src/web3/contract/contract';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  async create(createTransactionInput: Prisma.TransactionCreateInput) {
    return await this.prisma.transaction.create({
      data: { ...createTransactionInput },
    });
  }

  findAll() {
    return `This action returns all transaction`;
  }

  async findUnique(id: string) {
    return await this.prisma.transaction.findUnique({ where: { id } });
  }

  update(id: string, updateTransactionInput: Prisma.TransactionUpdateInput) {
    return this.prisma.transaction.update({
      data: { ...updateTransactionInput },
      where: { id },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }

  async isTransactionMined(txnHash: string) {
    if (!txnHash)
      throw new BadRequestException(`Invalid transaction hash: ${txnHash}`);

    let txnReceipt: TransactionReceipt;

    try {
      txnReceipt = await alchemyProvider
        .getTransactionReceipt(txnHash)
        .catch((e) => 'NOT_MINED' as any);
      if ((txnReceipt as any) === 'NOT_MINED') return txnReceipt;
    } catch (e) {
      return 'NOT_MINED';
    }
    if (!txnReceipt) return 'NOT_MINED';
    if (
      ![txnReceipt.to, txnReceipt.from].includes(
        Contract.getInstance().getContractAddress(),
      )
    )
      throw new BadRequestException(
        `Transaction hash '${txnHash}' is not related to the contract`,
      );
    const { blockNumber, status } = txnReceipt;

    if (!blockNumber && status === 1) return 'NOT_MINED';
    if (status === 0)
      throw new InternalServerErrorException(`${txnHash} failed`);
    return 'MINED';
  }

  async checkFiatStatus(txnId: string) {
    try {
      const txnStatus = await this.paymentService.checkTransactionStatus(txnId);
      return txnStatus;
    } catch (e) {
      console.log(e);
    }
  }

  async checkStatusAndProceed(
    txnHash: string,
    transactionDetails: Transaction,
  ) {
    const status = await this.isTransactionMined(txnHash);
    if (status === 'MINED') {
      const paymentDetails = await this.paymentService.pay(
        transactionDetails.FIAT * 100,
        transactionDetails.receiverVPA,
        transactionDetails.receiverAddress,
        transactionDetails.currency,
      );

      await this.update(transactionDetails.id, {
        status: 'CRYPTO_SUCCESS',
        fiatTransactionId: paymentDetails.id,
      });

      return paymentDetails;
    }
    throw new NotFoundException(`${txnHash} is not mined yet`);
  }
  async StatusCheck(txnId: string) {
    if (!txnId) throw new BadRequestException('No transaction ID provided');

    const txn = await this.findUnique(txnId);
    if (!txn) return;
    const { status, txnHash, fiatTransactionId } = txn;
    if (status === 'SUCCESS' || status === 'FAILED') return txn;
    if (status === 'PENDING') {
      const status = await this.orchestrateStatusCheck(
        false,
        fiatTransactionId,
        txnHash,
        txn,
      );
      if (status === 'MINED') txn.status = 'CRYPTO_SUCCESS';
    } else {
      const status = await this.orchestrateStatusCheck(
        true,
        fiatTransactionId,
        txnHash,
        txn,
      );
      if (status === 'processed') {
        await this.update(txn.id, { status: 'SUCCESS' });
        txn.status = 'SUCCESS';
      }
    }
    return txn;
  }
  async orchestrateStatusCheck(
    isCryptoTransactionMined: boolean,
    fiatTransactionId: string,
    txnHash: string,
    txn: Transaction,
  ) {
    try {
      if (isCryptoTransactionMined)
        return await this.checkFiatStatus(fiatTransactionId);
      return await this.checkStatusAndProceed(txnHash, txn);
    } catch (e) {
      return 'NOT_MINED';
    }
  }

  async initiateDebitFromVault(
    from: string,
    currency: string,
    amount: number,
    to: string,
  ) {
    const tokenAmount = await getConversionRate('MATIC', currency, amount);
    const amountInEthers = ethers.utils.parseEther(tokenAmount + '');

    const { hash } = await Contract.getInstance().payFromVaultViaUPI(
      from,
      amountInEthers,
    );
    // get user from address
    const user = await this.prisma.user.findUnique({
      where: { address: from },
    });
   
    const createdTransaction = await this.create({
      currency: currency as any,
      FIAT: amount,
      status: Status.PENDING,
      from: PaymentOrigin.VAULT,
      chain: Chain.MAT,
      txnHash: hash,
      fiatTransactionId: '',
      payer: {connectOrCreate:{where:{address:from},create:{address:from}}}, 
      receiverVPA: to,
      currencyType: CurrencyType.FIAT,
      value: amountInEthers.toString(),
    });

    return createdTransaction.id;
  }
}
