import axios from 'axios'
import { RAYZORPAY_PAYOUT_ENDPOINT, RAYZORPAY_TRANSACTION_STATUS } from 'src/common/api/urls/payout';
import { RayzorpayPayoutRequest } from 'src/types/api/payoutReq';
import { generateId } from "../../common/common.utils";

export default class Razorpay {
    
    private readonly headers: object;

    constructor() {
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`
        };
    }

    private getNameFromUPI(upi: string) {
        return upi.replace('@', ' ');
    }
    
    private getNarration(amountInSmallerUnit: number, currency?: string) {
    return `Received ${currency}${(amountInSmallerUnit / 100).toLocaleString()}`;
    }

    private async getRazorpayPayoutBodyForUPI(amount: number, upiId: string, currency: string) {
        const amountInSmallerUnit = amount * 100;
        const body: RayzorpayPayoutRequest = {
            account_number: upiId,
            amount: amountInSmallerUnit,
            currency: currency,
            fund_account: {
              account_type: 'vpa',
              contact: { name: this.getNameFromUPI(upiId) },
              vpa: { address: upiId },
            },
            mode: 'UPI',
            narration: this.getNarration(amountInSmallerUnit, currency),
            purpose: 'payout',
            reference_id: generateId(),
          };
          return body;
    }

    async payToUPI(amount: number, upiId: string, currency: string) {
        const body = await this.getRazorpayPayoutBodyForUPI(amount, upiId, currency);
        const payment = await axios.post(RAYZORPAY_PAYOUT_ENDPOINT, body, {
            headers: this.headers
        });
        return payment.data;
    }

    async checkTransactionStatus(txnId: string) {
        const url = RAYZORPAY_TRANSACTION_STATUS + txnId;
        const response = await axios.get(url)
        return response.data.status;
    }
}