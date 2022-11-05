import { Injectable } from '@nestjs/common';
import Razorpay from './razorpay'

@Injectable()
export class PaymentService {
    private readonly paymentVendor: Razorpay;
    constructor() {
        this.paymentVendor = new Razorpay();
    }

    async payToUPI(amount: number, upiId: string, currency: string) {
        this.paymentVendor.payToUPI(amount, upiId, currency);
    }

    async payToPublicAddress(amount: number, publicAddress: string) {
        throw new Error('Not implemented');
    }

    async pay(amount: number, currency: string, upiId: string | undefined, publicAddress: string | undefined) {
        if (upiId) {
            return this.payToUPI(amount, upiId, currency);
        }
        if (publicAddress) {
            return this.payToPublicAddress(amount, publicAddress);
        }
    }
}