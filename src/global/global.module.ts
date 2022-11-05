import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Global()
@Module({
  providers: [ConfigService, PrismaService, PaymentService],
  exports: [ConfigService, PrismaService, PaymentService],
})
export class GlobalModule {}
