import { BadRequestException } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import { alchemyProvider } from 'src/common/web3.utils';

export class Contract {
  private static instance: Contract | undefined;
  contractInstance: ethers.Contract | undefined;

  constructor() {
    const { CONTRACT_ADDRESS, CONTRACT_ABI, PRIVATE_KEY } = process.env;
    const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
    this.contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer,
    );
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Contract();
    }
    return this.instance;
  }

  getContractAddress() {
    return this.contractInstance.address;
  }

  async getVaultBalance(address: string) {
    if (ethers.utils.isAddress(address)) {
      const vaultBalance =
        await this.contractInstance.functions.getVaultBalance(address);
      return vaultBalance[0];
    }
    throw new BadRequestException(`${address} is not a valid address`);
  }

  async payFromVaultToCrypto(from: string, to: string, amount: BigNumber) {
    if (ethers.utils.isAddress(from) && ethers.utils.isAddress(to)) {
      const txn =
        await this.contractInstance.functions.initiateCryptoPaymentFromVault(
          from,
          to,
          amount,
        );

      return txn;
    }
    throw new BadRequestException(
      `${from} and/or ${to} are not valid addresses`,
    );
  }

  async payFromVaultViaUPI(from: string, amountInEthers: BigNumber) {
    if (ethers.utils.isAddress(from)) {
      const userBalance = (await Contract.getInstance().getVaultBalance(
        from,
      )) as BigNumber;

      if (userBalance.lt(amountInEthers))
        throw new BadRequestException(
          `User ${from} does not have enough balance in their vault`,
        );
      const txn =
        await this.contractInstance.functions.initiateUPIPaymentFromVault(
          from,
          amountInEthers,
        );

      return txn;
    }
    throw new BadRequestException(`${from} is not a valid address`);
  }
}
