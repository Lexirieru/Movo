export interface ReceiverInGroup {
  _id: string;
  groupId : string;
  // Token
  originCurrency : Token;
  tokenIcon : string;
  // receiverAddress
  depositWalletAddress : string;
  amount : string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  icon: string;
  balance: number;
}

export interface GroupOfUser {
  groupId: string;
  nameOfGroup: string;
  senderId: string;
  senderName: string;
  Receivers: ReceiverInGroup[];
  totalRecipients?: number; // optional
  createdAt?: string; // dari timestamps mongoose
  updatedAt?: string; // dari timestamps mongoose
}