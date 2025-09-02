import { ethers } from "ethers";
import payrollAbi from "../abi/payrollABI.json";
import dotenv from "dotenv";
import { TransactionHistoryModel } from "../models/transactionRecordModel";
import { GroupOfUserModel, UserModel } from "../models/userModel";
import escrowABI from "../abi/escrowABI.json";

dotenv.config();

const RPC_URL = process.env.RPC_URL!;
const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT!;

export const senderListener = async () => {
  if (!ESCROW_CONTRACT_ADDRESS || !RPC_URL) {
    throw new Error("Missing environment variables. Cek kembali file .env");
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  console.log("🔄 Listening to EscrowCreated events...");

  const contract = new ethers.Contract(
    ESCROW_CONTRACT_ADDRESS!,
    escrowABI,
    provider
  );

  contract.on(
    "EscrowCreated",
    async (
      escrowId,
      sender,
      totalAmount,
      createdAt,
      receivers,
      amounts,
      event
    ) => {
      console.log("📢 New Escrow Created!");
      console.log("Escrow ID:", escrowId);
      console.log("Sender:", sender);
      console.log("Total Amount:", totalAmount.toString());
      console.log("Created At (timestamp):", createdAt.toString());
      console.log("Receivers:", receivers);
      console.log(
        "Amounts:",
        amounts.map((a: any) => a.toString())
      );
      console.log("Block:", event.blockNumber);
      const userData = await UserModel.findOne({ walletAddress: sender });
      if (!userData) {
        console.log("User data not found!");
        return;
      }
      const addEscrowId = await GroupOfUserModel.findOneAndUpdate(
        { senderId: userData._id }, // filter by sender
        { $set: { escrowId } }, // set escrowId
        { new: true, sort: { createdAt: -1 } } // pilih group terbaru
      );
      if (addEscrowId) {
        console.log("EscrowId berhasil ditambahkan ke group:", addEscrowId._id);
      } else {
        console.log("Failed to fetch escrow ID");
      }
    }
  );

  // // 👂 Listener event sc (send transfer transaction dari wallet sender ke wallet escrow)
  // contract.on(
  //   "PayrollApproved",
  //   async (
  //     txId: string,
  //     senderId: string,
  //     senderName: string,
  //     receiverName: string,
  //     groupId: string,
  //     groupName: string,
  //     totalAmount: string,
  //     Receivers: string[],
  //     totalReceiver: number,
  //     originCurrency,
  //     event
  //   ) => {
  //     console.log("📡 Event PayrollApproved detected:");
  //     console.log("txId:", txId);
  //     console.log("Tx Hash:", event.transactionHash);
  //     console.log("Sender:", senderName);
  //     console.log("Total Receiver:", totalReceiver);
  //     console.log("Amount:", totalAmount);
  //     try {
  //       // ambil data transaksi untuk signature
  //       const tx = await provider.getTransaction(event.transactionHash);
  //       if (!tx) throw new Error("Transaction not found");

  //       const timestamp = (await provider.getBlock(tx.blockNumber!)).timestamp
  //         .toString;
  //       const receipt = await provider.getTransactionReceipt(
  //         event.transactionHash
  //       );

  //       // addTransactionHistory (biar gampang di searchnya wakkwak)
  //       const transactionHistory = new TransactionHistoryModel({
  //         txId,
  //         senderId,
  //         originCurrency,
  //         senderName,
  //         receiverName,
  //         groupId,
  //         groupName,
  //         totalAmount,
  //         Receivers: Receivers.map((receiverStr) => {
  //           const receiver = JSON.parse(receiverStr);
  //           return {
  //             email: receiver.email,
  //             fullname: receiver.fullname,
  //             amount: receiver.amount,
  //           };
  //         }),
  //         txHash: event.txHash,
  //         blockNumber: tx.blockNumber?.toString(),
  //         blockHash: receipt.blockHash,
  //         from: tx.from,
  //         to: tx.to,
  //         gasUsed: receipt.gasUsed.toString(),
  //         gasPrice: tx.gasPrice?.toString(),
  //         totalReceiver: Receivers.length,
  //         timestamp,
  //       });
  //       await transactionHistory.save();

  //       // ngeupdate availableBalance di userModel dan groupOfUserModel di fieldnya masing masing receiver
  //       for (const receiverStr of event.args.receivers as string[]) {
  //         const receiver = JSON.parse(receiverStr);

  //         // convert wei → ether number
  //         const amount = Number(ethers.utils.formatEther(receiver.amount));

  //         // update saldo di UserModel
  //         await UserModel.findOneAndUpdate(
  //           { email: receiver.email },
  //           // inc untuk ngeadd, bukan ngeoverwrite
  //           { $inc: { availableBalance: amount } },
  //           { new: true }
  //         );

  //         // update saldo di GroupOfUserModel
  //         await GroupOfUserModel.findOneAndUpdate(
  //           {
  //             groupId,
  //             "Receivers.email": receiver.email,
  //           },
  //           // inc untuk ngeadd, bukan ngeoverwrite
  //           { $inc: { "Receivers.$.availableBalance": amount } },
  //           { new: true }
  //         );

  //         console.log(
  //           `💰 Updated balance for ${receiver.email} (+${amount} ETH) in User & Group`
  //         );
  //       }
  //     } catch (err) {
  //       console.error("❌ Error handling PayrollApproved:", err);
  //     }
  //   }
  // );

  console.log("👂 Listening for PayrollApproved...");
};
