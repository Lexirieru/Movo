import { ethers } from "ethers";
import payrollAbi from "../abi/payrollABI.json";
import dotenv from "dotenv";
import {
  generateSignatureForSwap,
  generateSignatureForRedeem,
} from "../utils/generate_signature";
import {
  burnIdrx,
  checkGasFeeEstimation,
  checkIDRXBalance,
} from "../utils/burnIdrx";
import axios from "axios";

import BigNumber from "bignumber.js";
import { WithdrawHistoryModel } from "../models/transactionRecordModel";

dotenv.config();


// untuk ngewithdraw balance crypto ke wallet dia / fiat ke rekening dia dan ngeadd withdraw history
// export async function withdrawAndSaveHistory(req: Request, res: Response) {
//   // kalok wallet to wallet (crypto non idrx), listen ke sc 
//   // kalok wallet to fiat {crypto non idrx (usdc/usdt)}, listen ke sc
//   // kalok wallet to fiat (crypto idrx), backend yang jalanin

//   const {
//     _id, // receiver id
//     amount,
//     walletAddress,
//     choice, // "fiat" / "crypto"
//     originCurrency,
//     targetCurrency,
//     bankId,
//     bankName,
//     bankAccountName,
//     bankAccountNumber,
//     depositWalletAddress,
//   } = req.body;

//   const withdrawId = uuidv4(); // FE bisa generate, tapi biar aman bisa juga backend

//   try {
//     if (choice === "fiat") {
//       const path = "https://idrx.co/api/transaction/redeem-request";
//       const form = { id: _id, amount, walletAddress };

//       const bufferReq = Buffer.from(JSON.stringify(form), "base64").toString("utf8");
//       const timestamp = Math.round(new Date().getTime()).toString();
//       const sig = createSignature("POST", path, bufferReq, timestamp, secretKey);

//       const resData = await axios.post(path, form, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           "idrx-api-key": apiKey,
//           "idrx-api-sig": sig,
//           "idrx-api-ts": timestamp,
//         },
//       });

//       // simpan ke history
//       const newHistory = new WithdrawHistoryModel({
//         withdrawId,
//         receiverId: _id,
//         amount,
//         type: "fiat",
//         originCurrency,
//         targetCurrency,
//         bankId,
//         bankName,
//         bankAccountName,
//         bankAccountNumber,
//         depositWalletAddress,
//       });
//       await newHistory.save();

//       return res.status(200).json({
//         message: "Withdraw successful & history saved",
//         withdrawResponse: resData.data,
//         history: newHistory,
//       });
//     } else if (choice === "crypto") {
//       // misal langsung ke wallet (tanpa idrx)
//       const newHistory = new WithdrawHistoryModel({
//         withdrawId,
//         receiverId: _id,
//         amount,
//         type: "crypto",
//         originCurrency,
//         targetCurrency,
//         depositWalletAddress,
//       });
//       await newHistory.save();

//       return res.status(200).json({
//         message: "Crypto withdraw history saved (mocked execution)",
//         history: newHistory,
//       });
//     } else {
//       return res.status(400).json({ message: "Invalid choice type" });
//     }
//   } catch (err: any) {
//     console.error("Withdraw error:", err);
//     return res.status(500).json({
//       message: "Error processing withdraw",
//       error: err.message,
//     });
//   }
// }

export const receiverListener = async () => {
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
  
  // listen to receiver withdraw smartcontract's event
  contract.on(
    "WithdrawApproved",
    async (
      withdrawId : string,
      receiverId: string,
      amount: string,
      choice : string,
      originCurrency: string,
      targetCurrency: string,
      bankId: string,
      depositWalletAddress: string,
      bankName: string,
      bankAccountName: string,
      bankAccountNumber: string,
      walletAddress : string,
      networkChainId : string,
      event: string
    ) => {
      console.log(`[EVENT RECEIVED]`);

      console.log({
        withdrawId,
        receiverId,
        amount,
        choice,
        originCurrency,
        targetCurrency,
        bankId,
        depositWalletAddress,
        bankName,
        bankAccountName,
        bankAccountNumber,
        walletAddress,
        networkChainId
      });      
      // kalok wallet to wallet (originCurrencynya crypto non idrx), listen ke sc  (sc send langsung ke walletAddress)
      if(choice == "crypto"){
        // listen to sc (sc send langsung ke walletAddress) -> backend dapetin parameter yang disend dari eventnya sc -> 
        // backend ngesave parameter tersebut ke db
        try{
          const withdrawHistory = new WithdrawHistoryModel({
            withdrawId,
            receiverId,
            amount,
            choice,
            originCurrency,
            targetCurrency,
            networkChainId,
            walletAddress
          })
          await withdrawHistory.save();
        }
        catch(err){
          console.log(err);
          return;
        }
      }
      // kalok wallet to fiat {originCurrencynya crypto usdc/usdt}, listen ke sc (sc send langsung ke depositwalletaddress)
      else if(choice == "fiat" && (originCurrency == "USDC" || originCurrency == "USDT"))
      {
        try{
          const withdrawHistory = new WithdrawHistoryModel({
            withdrawId,
            receiverId,
            amount,
            choice,
            originCurrency,
            targetCurrency,
            depositWalletAddress,
            bankId,
            bankName,
            bankAccountName,
            bankAccountNumber
          })
          await withdrawHistory.save();
        }
        catch(err){
          console.log(err);
          return;
        }
        // listen to sc (sc send langsung ke depositWalletAddress) -> backend dapetin parameter yang disend dari eventnya sc -> 
        // backend ngesave parameter tersebut ke db
      }
    }
  );

  console.log("Listening for PayrollApproved...");
};


