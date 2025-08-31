export interface WithdrawHistory {
  withdrawId: string;
  receiverId: string;
  amount: string;
  choice: string;
  originCurrency: string;
  targetCurrency: string; 
  networkChainId?: string; 
  walletAddress?: string;
  depositWalletAddress?: string;
  bankId?: string; 
  bankName?: string; 
  bankAccountName?: string; 
  bankAccountNumber?: string; 
  createdAt : Date
}
export interface TransactionHistory {
  txId: string;
  txHash: string;
  senderId: string;
  senderName: string;
  groupId: string;
  groupName: string; 
  totalAmount: string;
  Receiver : Receiver[];
  totalReceiver : string;
  blockNumber : string;
  blockHash : string;
  from : string;
  to : string;
  status : string;
  gasUsed : string;
  gasPrice : string;
  timeStmap : string;
  originCurrency : string;
}

export interface Receiver {
  email: string;
  fullname: string;
  amount: string;
  createdAt: string; // biasanya sampai ke FE dikirim dalam bentuk ISO string, bukan Date object
}