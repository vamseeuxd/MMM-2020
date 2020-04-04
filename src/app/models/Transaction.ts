export interface Transaction {
  label: string;
  repeat: string;
  startDate: string;
  interval: number;
  amount: number;
  type: string;
  remarks: string;
  endDate: string;
  isTaxSavings: boolean;
  userUid: string;
  breakups?: Array<any>;
  id?: string;
}
