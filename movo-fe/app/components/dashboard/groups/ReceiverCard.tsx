import { ReceiverInGroup } from '@/types/receiverInGroupTemplate';
import { Mail, Wallet, User } from 'lucide-react';

interface ReceiverCardProps {
  receiver: ReceiverInGroup;
}

export default function ReceiverCard({ receiver }: ReceiverCardProps) {
  const shortAddress = `${receiver.depositWalletAddress.substring(0, 6)}...${receiver.depositWalletAddress.substring(receiver.depositWalletAddress.length - 4)}`;

  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div className="flex items-center space-x-3">
        <User className="w-5 h-5 text-cyan-400" />
        <div>
          {/* <p className="font-medium text-white">{receiver.fullname}</p>
          <p className="text-xs text-white/60 font-mono">{receiver.email}</p> */}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Wallet className="w-5 h-5 text-cyan-400" />
        <p className="text-sm text-white/80 font-mono">{shortAddress}</p>
      </div>
      <div className="text-left md:text-right">
        {receiver.amount && (
           <p className="text-lg font-bold text-cyan-300">
             {receiver.amount.toLocaleString()} <span className="text-sm font-normal text-white/60">{receiver.originCurrency.balance}</span>
           </p>
        )}
      </div>
    </div>
  );
}