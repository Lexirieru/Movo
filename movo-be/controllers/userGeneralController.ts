import { Request, Response } from "express";
import {UserModel } from "../models/userModel"; // Pastikan path-nya benar
import { createSignature } from "../utils/generate_signature";
import axios from "axios";
import fs from "fs";

const movoApiKey = process.env.IDRX_API_KEY!;
const movoSecretKey = process.env.IDRX_SECRET_KEY!;

// controller untuk MOVO
export async function onBoardingUser(req: Request, res: Response){
  const {email, fullname} = req.body
  const path = "https://idrx.co/api/auth/onboarding";
  console.log(email, fullname)
  const form = {
    email,
    fullname, 
    // address, 
    // idNumber, 
    idFile : fs.createReadStream('./Screenshot 2025-08-28 at 22.36.43.png')
  }

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
      fullname,
      idFile : form.idFile.path,
      apiKey : resData.data.data.apiKey,
      secretKey : resData.data.data.apiSecret,
    });

    await newUser.save();
    res.status(201).json({
      data : resData.data
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json(err)
    return
  }
} 
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
    // console.log('res.data: ');
    console.log(resData.data.data);

    const updatedUser = await UserModel.findOneAndUpdate({email}, {
      bankId : resData.data.data.id,
      bankAccountNumber: resData.data.data.bankAccountNumber,
      bankAccountName: resData.data.data.bankAccountName,
      bankCode: resData.data.data.bankCode,
      bankName : resData.data.data.bankName,
      depositWalletAddress : resData.data.data.DepositWalletAddress.walletAddress,
    }, { new: true});

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
  console.log(user)
  if(!user){
    res.status(404).json({message: "User not found"});
    return
  }

  console.log(user.bankId)
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


