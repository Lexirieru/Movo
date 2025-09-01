import mongoose, { Schema } from "mongoose";

const UserDataSchema = new Schema(
  {
    idrxId: {
      type: String,
      required: true,
      unique: true,
    },
    bankId: {
      type: String,
      required: false,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hashedPassword: {
      type: String,
      required: true,
      unique: true,
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
      unique: true,
    },
    secretKey: {
      type: String,
      required: true,
      unique: true,
    },
    depositWalletAddress: {
      type: String,
      required: false,
      unique: false,
    },
    hashBankAccountNumber: {
      type: String,
      required: false,
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
    bankName: {
      type: String,
      required: false,
    },
    availableBalance: {
      type: Number,
      required: false,
    },
    ListOfRegisteredBankAccount: [
      {
        bankAccountNumber: { type: String, required: true },
        bankAccountName: { type: String, required: true },
        bankCode: { type: Number, required: true },
        bankName: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }, // optional
      },
    ],
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
        // dari be
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

        // dari fe
        originCurrency : {
          type : String,
          required : true
        },
        tokenIcon : {
          type : String,
          required : true
        },
        depositWalletAddress : {
          type: String,
          required: true,
        },
        amount : {
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
  userId : {
    type : String,
    required : true
  },
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
