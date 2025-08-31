import { ethers } from "ethers";
import payrollAbi from "../abi/payrollABI.json";
import dotenv from "dotenv";
import { TransactionHistoryModel } from "../models/transactionRecordModel";
import { GroupOfUserModel, UserModel } from "../models/userModel";

dotenv.config();

type RedeemTxMeta = {
  txHash: string;
  signature: string;
  timestamp: string;
};

let lastRedeemTxMeta: RedeemTxMeta | null = null;

export function setRedeemTxMeta(meta: RedeemTxMeta) {
  lastRedeemTxMeta = meta;
}

export function getRedeemTxMeta(): RedeemTxMeta | null {
  return lastRedeemTxMeta;
}

export const senderListener = async () => {
  if (
    !process.env.LISK_SEPOLIA ||
    !process.env.CONTRACT_ADDRESS ||
    !process.env.IDRX_API_KEY ||
    !process.env.IDRX_SECRET_KEY
  ) {
    throw new Error("Missing environment variables. Cek kembali file .env");
  }

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.LISK_SEPOLIA!
  );

  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS!,
    payrollAbi,
    provider
  );

  // 👂 Listener event sc (send transfer transaction dari wallet sender ke wallet escrow)
  contract.on(
    "PayrollApproved",
    async (
      txId: string,
      senderId: string,
      senderName: string,
      groupId : string,
      groupName : string,
      totalAmount : string,
      Receivers : string[],
      totalReceiver : number,
      originCurrency,
      event
    ) => {
      console.log("📡 Event PayrollApproved detected:");
      console.log("txId:", txId);
      console.log("Tx Hash:", event.transactionHash);
      console.log("Sender:", senderName);
      console.log("Total Receiver:", totalReceiver);
      console.log("Amount:",totalAmount);
      try {
        // ambil data transaksi untuk signature
        const tx = await provider.getTransaction(event.transactionHash);
        if (!tx) throw new Error("Transaction not found");

        const timestamp = (await provider.getBlock(tx.blockNumber!))
          .timestamp.toString();
        const receipt = await provider.getTransactionReceipt(event.transactionHash);

        const transactionHistory = new TransactionHistoryModel({
          txId,
          senderId,
          originCurrency,
          senderName,
          groupId,
          groupName,
          totalAmount,
          Receivers: Receivers.map((receiverStr) => {
            const receiver = JSON.parse(receiverStr);
            return {
              email: receiver.email,
              fullname: receiver.fullname,
              amount: receiver.amount,
            };
          }),
          txHash: event.txHash,
          blockNumber: tx.blockNumber?.toString(),
          blockHash: receipt.blockHash,
          from: tx.from,
          to: tx.to,
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: tx.gasPrice?.toString(),
          totalReceiver : Receivers.length,
          timestamp
        });
        await transactionHistory.save();

        // ngeupdate availableBalance di userModel dan groupOfUserModel di fieldnya masing masing receiver
        for (const receiverStr of event.args.receivers as string[]) {
          const receiver = JSON.parse(receiverStr);

          // convert wei → ether number
          const amount = Number(ethers.utils.formatEther(receiver.amount));

          // update saldo di UserModel
          await UserModel.findOneAndUpdate(
            { email: receiver.email },
            // inc untuk ngeadd, bukan ngeoverwrite
            { $inc: { availableBalance: amount } },
            { new: true }
          );
          
          // update saldo di GroupOfUserModel
          await GroupOfUserModel.findOneAndUpdate(
            {
              groupId,
              "Receivers.email": receiver.email,
            },
            // inc untuk ngeadd, bukan ngeoverwrite
            { $inc: { "Receivers.$.availableBalance": amount } },
            { new: true }
          );

          console.log(
            `💰 Updated balance for ${receiver.email} (+${amount} ETH) in User & Group`
          );
        }
      } catch (err) {
        console.error("❌ Error handling PayrollApproved:", err);
      }
    }
  );

  console.log("👂 Listening for PayrollApproved...");
};
