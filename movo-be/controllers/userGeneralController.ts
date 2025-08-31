import { Request, Response } from "express";
import { UserModel } from "../models/userModel"; // Pastikan path-nya benar
import { createSignature } from "../utils/generate_signature";
import axios from "axios";
import fs from "fs";
import bcrypt from "bcrypt";
import { generateCookiesToken } from "../routes/auth";
import { sha256 } from "ethers/lib/utils";

const movoApiKey = process.env.IDRX_API_KEY!;
const movoSecretKey = process.env.IDRX_SECRET_KEY!;

export async function onBoardingUser(req: Request, res: Response){
  const {email, fullname, password} = req.body;

  if(!email || !fullname){
    res.status(404).json({message: "Email and fullname are required!"})
    return;
  }
  const saltRounds = 10; // default cukup 10, jangan terlalu tinggi biar ga lambat
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  console.log(email, password, fullname)
  const form = {
    email,
    fullname, 
    hashedPassword,
    // address, 
    // idNumber, 
    idFile : fs.createReadStream('./Screenshot 2025-08-28 at 22.36.43.png')
  }
  
  const path = "https://idrx.co/api/auth/onboarding";
  const bufferReq = Buffer.from(JSON.stringify(form), 'base64').toString('utf8');
  const timestamp = Math.round((new Date()).getTime()).toString();
  const sig = createSignature('POST', path, bufferReq, timestamp, movoSecretKey);
  
  try{
    const resData = await axios.post(path, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'idrx-api-key': movoApiKey,
        'idrx-api-sig': sig,
        'idrx-api-ts' : timestamp,
      },
    }); 

    console.log("api key: ", resData.data.data.apiKey);
    console.log('res.data: ');
    console.log(resData.data);

    const newUser = new UserModel({
      idrxId : resData.data.data.id,
      email,
      hashedPassword,
      fullname,
      idFile : form.idFile.path,
      apiKey : resData.data.data.apiKey,
      secretKey : resData.data.data.apiSecret,
    });

    // kurang mbuat handle untuk user yang udah onboard alias user yang mau login

    await newUser.save();

    const token = await generateCookiesToken(email, newUser);

    res.cookie("user_session", token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
    });
    
    res.status(200).json({
      message: "Login successful",
      statusCode : 200,
    });
    return
  }
  catch(err){
    console.log(err);
    res.status(500).json(err)
    return
  }
} 

// export async function loadAllGroupPaymentAndWithdrawHistory(req: Request, res: Response) {
//   const { _id } = req.body;

//   try {
//     // Ambil semua payment history
//     const paymentHistories = await TransactionHistoryModel.find({ senderId: _id })
//       .sort({ timestamp: -1 })
//       .lean();

//     // Ambil semua withdraw history
//     const withdrawHistories = await WithdrawHistoryModel.find({ receiverId: _id })
//       .sort({ timestamp: -1 })
//       .lean();

//     // Samakan struktur data biar bisa digabung
//     const normalizedPayments = paymentHistories.map((p) => ({
//       ...p,
//       historyType: "payment",
//       createdAt: p.timestamp, // fallback ke createdAt kalau ada
//     }));

//     const normalizedWithdraws = withdrawHistories.map((w) => ({
//       ...w,
//       historyType: "withdraw",
//       createdAt: w.createdAt,
//     }));

//     // Gabungkan
//     const allHistories = [...normalizedPayments, ...normalizedWithdraws]
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


//     res.status(200).json({
//       message: "Payment and Withdraw history successfully loaded",
//       data: allHistories,
//     });
//   } catch (err: any) {
//     res.status(500).json({
//       message: "Error loading payment and withdraw history",
//       error: err.message,
//     });
//   }
// }

export async function addBankAccount(req : Request, res : Response){
  const {email, bankAccountNumber, bankCode} = req.body
  const form = {
    bankAccountNumber, 
    bankCode,
  }  
  
  const path = "https://idrx.co/api/auth/add-bank-account";
  const bufferReq = Buffer.from(JSON.stringify(form), 'base64').toString('utf8');
  const timestamp = Math.round((new Date()).getTime()).toString();
  
  const user = await UserModel.findOne({email});
  if(!user){
    res.status(404).json({message: "User not found"});
    return
  }
  const sig = createSignature('POST', path, bufferReq, timestamp, user.secretKey!);

  try{
    const resData = await axios.post(path, form, {
      headers: {
        'Content-Type': 'application/json',
        'idrx-api-key': user.apiKey,
        'idrx-api-sig': sig,
        'idrx-api-ts' : timestamp,
      },
    });

    // const bank = `${user.bankName}_${user.bankAccountNumber}`;
    // console.log(bank)
    // const hashBankAccountNumber = sha256(bank).toString();
    console.log(resData.data.data)
    console.log(resData.data.statusCode);

    const updatedUser = await UserModel.findOneAndUpdate({email}, {
      bankId : resData.data.data.id,
      // hashBankAccountNumber,
      bankAccountNumber: resData.data.data.bankAccountNumber,
      bankAccountName: resData.data.data.bankAccountName,
      bankCode: resData.data.data.bankCode,
      bankName : resData.data.data.bankName,
      depositWalletAddress : resData.data.data.DepositWalletAddress.walletAddress,
    }, { new: true});

    console.log(updatedUser)

    
    if(!updatedUser){
      res.status(404).json({message: "User not found"});
      return
    }
    res.status(201).json({
      data : updatedUser
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json(err)
    return
  }

}

export async function getBankAccount(req : Request, res : Response) {
  const {email} = req.body; 
  const path = "https://idrx.co/api/auth/get-bank-accounts";

  const user = await UserModel.findOne({email});
  if(!user){
    res.status(404).json({message: "User not found"});
    return
  }

  const bufferReq = Buffer.from("", "base64").toString("utf8");
  const timestamp = Math.round(new Date().getTime()).toString();
  const sig = createSignature("GET", path, bufferReq, timestamp, user.secretKey);

  const resData = await axios.get(path, {
    headers: {
      "Content-Type": "application/json",
      "idrx-api-key": user.apiKey,
      "idrx-api-sig": sig,
      "idrx-api-ts": timestamp,
    },
  });
  res.status(401).json({data : resData.data});
  return;
}


// acuannya adalah bankId (bankId adalah id yang digenerate oleh idrx setiap selesai adding bank accounts)
export async function deleteBankAccount(req : Request, res : Response) {
  const {email} = req.body; 
  if(!email){
    res.status(404).json("Missing email");
    return;
  }
  
  const user = await UserModel.findOne({email});
  if(!user){
    res.status(404).json({message: "User not found"});
    return
  }

  const path = `https://idrx.co/api/auth/delete-bank-account/${user.bankId}`;
  const bufferReq = Buffer.from("", "base64").toString("utf8");
  const timestamp = Math.round(new Date().getTime()).toString();
  const sig = createSignature("DELETE", path, bufferReq, timestamp, user.secretKey);

  const resData = await axios.delete(path, {
    headers: {
      "Content-Type": "application/json",
      "idrx-api-key": user.apiKey,
      "idrx-api-sig": sig,
      "idrx-api-ts": timestamp,
    },
  });
  console.log(resData)

    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      {
        $unset: {
          bankId: "",
          bankAccountNumber: "",
          bankAccountName: "",
          bankCode: "",
          bankName: "",
          depositWalletAddress: "",
          // hashBankAccountNumber : "",
        }
      },
      { new: true }
    );

    if(!updatedUser){
      res.status(404).json({message: "User not found"});
      return
    }

    res.status(201).json({message : "Successfully delete bankAccounts", data :resData.data});
    
  console.log("berhasil hapus bankAccount")
  return;
}

// acuannya adalah bankId (bankId adalah id yang digenerate oleh idrx setiap selesai adding bank accounts)
export async function changeBankAccount(req: Request, res: Response) {
  const { email, bankAccountNumber, bankCode } = req.body;

  if (!email || !bankAccountNumber || !bankCode) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const timestamp = Math.round(new Date().getTime()).toString();

  try {
    // 1. Delete existing bank account if exists
    if (user.bankId) {
      const deletePath = `https://idrx.co/api/auth/delete-bank-account/${user.bankId}`;
      const deleteSig = createSignature("DELETE", deletePath, "", timestamp, user.secretKey!);

      await axios.delete(deletePath, {
        headers: {
          "Content-Type": "application/json",
          "idrx-api-key": user.apiKey!,
          "idrx-api-sig": deleteSig,
          "idrx-api-ts": timestamp,
        },
      });
    }

    // 2. Add new bank account
    const addPath = "https://idrx.co/api/auth/add-bank-account";
    const form = { bankAccountNumber, bankCode };
    const addSig = createSignature("POST", addPath, Buffer.from(JSON.stringify(form), "base64").toString("utf8"), timestamp, user.secretKey!);

    const addRes = await axios.post(addPath, form, {
      headers: {
        "Content-Type": "application/json",
        "idrx-api-key": user.apiKey!,
        "idrx-api-sig": addSig,
        "idrx-api-ts": timestamp,
      },
    });

    const newBankData = addRes.data.data;
    // const bank = `${newBankData.bankName}_${newBankData.bankAccountNumber}`;
    // const hashBankAccountNumber = await sha256(bank).toString();
    
    // 3. Update user with new bank info
    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      {
        bankId: newBankData.id,
        // hashBankAccountNumber,
        bankAccountNumber: newBankData.bankAccountNumber,
        bankAccountName: newBankData.bankAccountName,
        bankCode: newBankData.bankCode,
        bankName: newBankData.bankName,
        depositWalletAddress: newBankData.DepositWalletAddress.walletAddress,
      },
      { new: true }
    );

    res.status(200).json({ message: "Bank account changed successfully", data: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change bank account", error: err });
  }
}

// controller untuk admin MOVO 
export async function getOrganizationMembers(req: Request, res: Response) {
  const path = "https://idrx.co/api/auth/members";
  const bufferReq = Buffer.from("", "base64").toString("utf8");
  const timestamp = Math.round(new Date().getTime()).toString();
  const sig = createSignature("GET", path, bufferReq, timestamp, movoSecretKey);

  try{
    const resData = await axios.get(path,  {
    headers: {
      'Content-Type': 'multipart/form-data',
      'idrx-api-key': movoApiKey,
      'idrx-api-sig': sig,
      'idrx-api-ts' : timestamp,
    },
  }); 
    res.status(200).json(resData.data);
    console.log('res.data: ');
    console.log(resData.data);
  }
  catch(err){
    console.log(err);
    res.status(500).json(err)
    return
  }
}

// buat controller untuk ngasih akses ke FE biar bisa akses status berdasarkan txIdnya
export async function loadTransactionStatusData(
  txHash: string,
  API_KEY: string
) {
  try {
    const response = await axios.get(
      `https://idrx.co/api/transaction/user-transaction-history?transactionType=DEPOSIT_REDEEM&txHash=${txHash}&page=1&take=1`,
      {
        headers: {
          "Content-Type": "application/json",
          "idrx-api-key": API_KEY,
          "idrx-api-sig" : "v0-lo3DmbCH8U7B1HyVKW1EJ7m0IMRMwT9w-2_tZdP0"
        },
      }
    );
    if (!response.data) {
      console.log(response.data);
      return response.data;
    } else {
      console.log(response);
      console.log("[API Response]", response.data);
      console.log(response.data.records[0].status);
      return response.data.records[0].status;
    }
  } catch (err: any) {
    console.error("[Failed to call redeem-request]", err);
    // return err.message;
  }
}


