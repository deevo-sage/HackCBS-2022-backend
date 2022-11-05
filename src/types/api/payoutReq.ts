export interface RayzorpayPayoutRequest {
  account_number: string;
  narration: string; // Displayed in bank statement
  amount: number;
  currency: string;
  mode: 'UPI';
  purpose:
    | 'refund'
    | 'cashback'
    | 'payout'
    | 'salary'
    | 'utility bill'
    | 'vendor bill';
  fund_account: {
    account_type: 'vpa';
    vpa: {
      address: string;
    };
    contact: {
      name: string;
      email?: string;
      contact?: string;
      type?: 'self' | 'vendor' | 'customer' | 'employee';
      reference_id?: string;
      notes?: any;
    };
  };
  queue_if_low_balance?: boolean;
  reference_id: string;
  notes?: any;
}
