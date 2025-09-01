import { Request, Response } from "express";
import { GroupOfUserModel, UserModel } from "../models/userModel"; // Pastikan path-nya benar
import { TransactionHistoryModel } from "../models/transactionRecordModel";
import mongoose from "mongoose";
// const apiKey = process.env.IDRX_API_KEY!;
// const secretKey = process.env.IDRX_SECRET_KEY!;

// untuk ngeinisialisasi group baru
export async function addGroup(req: Request, res: Response) {
  // groupId ntar dari FE ngegenerate sendiri pake uuid
  const {_id, email, groupId, nameOfGroup} = req.body;
  
  try {
    if(!_id|| !groupId || !nameOfGroup){
      res.status(400).json({
        message: "Email, groupId, and nameOfGroup are required",
      });
      return;
    }
    const existingGroup = await GroupOfUserModel.findOne({ groupId });
    if(existingGroup){
      res.status(400).json({
        message : "Group with the same ID already exists"
      })
      return
    }
    const senderData = await UserModel.findById(_id);
    if(!senderData){
      res.status(404).json({
        message:  "Sender with the provided email is not found"
      })
      return
    }
    const newGroup = new GroupOfUserModel({
      email,
      groupId,
      nameOfGroup,
      senderId : senderData._id,
      senderName : senderData.fullname
    });

    const saved = await newGroup.save();
    
    res.status(201).json({
      message: "New Groupsuccessfully created",
      data: saved,
    });
    return;
  } catch (err: any) {
    res.status(500).json({
      message: "Error adding new group",
      error: err.message,
    });
    return;
  }
}


// untuk ngeadd receiver ke suatu grup lewat depositwalletaddress dia
// untuk ngeadd receiver ke suatu grup lewat depositWalletAddress + sekalian nambahin amount
export async function addReceiverToGroup(req: Request, res: Response) {
  const { _id, originCurrency, tokenIcon, groupId, depositWalletAddress, amount } = req.body;

  if (!depositWalletAddress || !amount) {
    res.status(400).json({
      message: "DepositWalletAddress and amount are required",
    });
    return;
  }

  const groupData = await GroupOfUserModel.findOne({ groupId });
  if (!groupData) {
    res.status(404).json({ message: "Group not found" });
    return;
  }

  if (groupData.senderId.toString() !== _id) {
    res.status(403).json({ message: "You are not authorized to modify this group" });
    return;
  }

  try {
    const userData = await UserModel.findOne({ depositWalletAddress });
    if (!userData) {
      res.status(404).json({
        message: "User not found with the provided deposit wallet address",
      });
      return;
    }

    // push receiver baru beserta amount
    const updatedGroup = await GroupOfUserModel.findOneAndUpdate(
      { groupId },
      {
        $push: {
          Receivers: {
            id: userData._id,
            email: userData.email,
            fullname: userData.fullname,
            apiKey: userData.apiKey,
            secretKey: userData.secretKey,
            depositWalletAddress: userData.depositWalletAddress,
            originCurrency,
            tokenIcon,
            amount,
          },
        },
        $inc: { totalRecipients: 1 },
      },
      { new: true } // supaya return document terbaru
    );

    if (!updatedGroup) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    res.status(201).json({
      message: "Receiver successfully added to group with amount",
      group: updatedGroup,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Error adding receiver to group",
      error: err.message,
    });
  }
}

//untuk ngefetch semua receivers yang ada di suatu grup 
export async function fetchReceiversInGroup(req : Request, res: Response){
  const {groupId, _id} = req.body;
  try{
    const groupData = await GroupOfUserModel.findOne({groupId});
    
    if(!groupData){
      res.status(404).json({
        message: "Group not found",
      });
      return;
    }

    if(groupData.senderId.toString() !== _id){
      res.status(403).json({
        message: "You are not authorized to view this group",
      });
      return;
    }
    
    res.status(201).json({
      message: "Receivers successfully fetched",
      receivers: groupData.Receivers,
    });
    return;
  }
  catch(err: any){
    res.status(500).json({
      message: "Error fetching receivers in group",
      error: err.message,
    });
    return;
  }
}

// untuk nampilin semua group yang dia gaji
export async function loadAllGroup(req: Request, res: Response) {
  const {_id} = req.body;

  try {
    const loadAllGroup = await GroupOfUserModel.find({
      senderId : _id,
    })
      .sort({ timestamp: -1 }) // descending (terbaru di atas)
      .lean(); // supaya hasilnya plain JS object dan lebih cepat

    res.status(201).json({
      message: "Group successfully fetched",
      data: loadAllGroup,
    });
    return;
  } catch (err: any) {
    res.status(500).json({
      message: "Error fetching/sending all fetched group",
      error: err.message,
    });
    return;
  }
}
// untuk nampilin satu specified group yang dia gaji
export async function loadSpecifiedGroup(req: Request, res: Response) {
  const {_id, groupId} = req.body;

  try {
    const loadSpecifiedGroup = await GroupOfUserModel.findOne({
      senderId : _id, 
      groupId
    })

    res.status(201).json({
      message: "Specified group successfully fetched",
      data: loadSpecifiedGroup,
    });
    return;
  } catch (err: any) {
    res.status(500).json({
      message: "Error sending specified group",
      error: err.message,
    });
    return;
  }
}
// untuk ngeremove receiver dari group
export async function removeReceiverDataFromGroup(req: Request, res: Response) {

  const { receiverId, groupId, senderId } = req.body;

  if (!groupId || !receiverId || !senderId) {
    res.status(400).json({
      message: "groupId, receiverAddress, and sender _id are required",
    });
    return;
  }

  try {
    // pastikan receiverId adalah string dari _id yang ingin dihapus
    const groupData = await GroupOfUserModel.findOneAndUpdate(
      { groupId, senderId },
      {
        $pull: { Receivers: { _id: new mongoose.Types.ObjectId(receiverId) } }, // perhatikan 'Receivers' dan ObjectId
      },
      { new: true } // kembalikan data setelah update
    );

    console.log("Updated group:", groupData);

    console.log(groupData)
    if (!groupData) {
      res.status(404).json({
        message: "Group or receiver not found",
      });
      return;
    }

    res.status(200).json({
      message: "Receiver successfully removed from group",
      group: groupData,
    });
    return;
  } catch (err: any) {
    res.status(500).json({
      message: "Error removing receiver from group",
      error: err.message,
    });
    return;
  }
}
// untuk ngehapus satu group spesifik
export async function deleteGroup(req: Request, res: Response){
  const {_id, groupId} = req.body;

  if(!groupId || !_id){
    res.status(400).json({
      message: "groupId and sender _id are required",
    });
    return;
  }

  try{
    const deletedGroup = await GroupOfUserModel.findOneAndDelete({groupId, senderId: _id});
    if(!deletedGroup){
      res.status(404).json({
        message: "Group not found",
      });
      return;
    }

    res.status(200).json({
      message: "Group successfully deleted",
      group: deletedGroup,
    });
    return;
  }
  catch(err: any){
    res.status(500).json({
      message: "Error deleting group",
      error: err.message,
    });
    return;
  }


}
// history tentang kapan dia ngebayar semua receivernya, berapa totalnya
export async function loadAllGroupTransactionHistory(req: Request, res: Response){
  const {_id} = req.body;

  try {
    const histories = await TransactionHistoryModel.find({ senderId : _id})
          .sort({ timestamp: -1 })
          .lean();
    res.status(201).json({
      data : histories,
      message: "Transaction history successfully sended",
    });
    return;
  } catch (err: any) {
    res.status(500).json({
      message: "Error sending transaction history",
      error: err.message,
    });
    return;
  }
}
// siapa namanya, berapa total yang dia terima 
export async function loadSpecifiedGroupTransactionHistory(req: Request, res: Response){
  const {_id, groupId,txId} = req.body;

  try {
    // dapetin detail transaksi history ke masing masing receivernya pada satu transaksi group tertentu
    const detailPaymentHistory = await TransactionHistoryModel.findOne({senderId: _id, groupId, txId }) 
    if(!detailPaymentHistory){
      res.status(404).json({
        message : "Transaction history not found"
      })
      return
    }
    res.status(201).json({
      message: "Transaction history successfully sended",
      data: detailPaymentHistory.Receivers,
    });
    return;

  } catch (err: any) {
    res.status(500).json({
      message: "Error sending transaction history",
      error: err.message,
    });
    return;
  }
}