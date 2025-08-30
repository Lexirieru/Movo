import { findPackageJSON } from "module";
import mongoose, { Schema } from "mongoose";

const UserDataSchema = new Schema(
  {
    idrxId : {
      type : String,
      required : true,
      unique : true,
    },
    bankId : {
      type : String,
      required : false,
      unique : false,
    },
    email : {
      type: String,
      required : true,
      unique : true,
    },
    fullname: {
      type: String,
      required: true,
    },
    idFile: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique : true,
    },
    secretKey: {
      type: String,
      required: true,
      unique : true,
    },
    // wallet yang digenerate oleh IDRX
    depositWalletAddress :{
      type: String,
      required: false,
      unique : false,
    },

    bankAccountNumber: {
      type: String,
      required: false,
    },
    bankAccountName: {
      type: String,
      required: false,
    },
    bankCode: {
      type: Number,
      required: false,
    },
    bankName : {
      type : String,
      required : false,
    },
    // total jumlah uang sisa yang belum diwithdraw
    availableBalance: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export const UserModel = mongoose.model("UserData", UserDataSchema);

const GroupOfUserSchema = new Schema(
  {
    groupId: {
      type: String,
      required: true,
    },
    nameOfGroup: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    Receivers: [
      {
        id: {
          type: String,
          required : true,
        },
        email : {
          type: String,
          required : true,
        },
        fullname: {
          type: String,
          required: true,
        },
        apiKey : {
          type: String,
          required: true,
        },
        secretKey : {
          type: String,
          required: true,
        },
        depositWalletAddress : {
          type: String,
          required: true,
        },
        availableBalance : {
          type: Number,
          required : false,
        },
      },
    ],
    totalRecipients: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export const GroupOfUserModel = mongoose.model(
  "GroupOfUserData",
  GroupOfUserSchema
);

const LoginSessionTokenSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

export const LoginSessionTokenModel = mongoose.model(
  "LoginSession",
  LoginSessionTokenSchema
);
