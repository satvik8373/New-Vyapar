export type TransactionType =
  | 'SALARY'
  | 'BUY_PROPERTY'
  | 'PAY_RENT'
  | 'PAY_TAX'
  | 'EVENT_REWARD'
  | 'EVENT_PENALTY'
  | 'BANK_DIVIDEND';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: number;
  fromPlayerId: string | 'BANK';
  toPlayerId: string | 'BANK';
  description: string;
  timestamp: number;
}
