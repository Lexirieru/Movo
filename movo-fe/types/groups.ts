// Definisikan tipe untuk satu penerima (Receiver)
export interface Receiver {
  id: string;
  email: string;
  fullname: string;
  depositWalletAddress: string;
  availableBalance?: number;
}

// Definisikan tipe untuk satu Grup
export interface GroupOfUser {
  groupId: string;
  nameOfGroup: string;
  senderId: string;
  senderName: string;
  Receivers: Receiver[];
  totalRecipients: number;
  createdAt: Date;
}