import { GroupOfUser } from "@/types/receiverInGroupTemplate";
import axios, { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
}



export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject({ message: "Request timeout" });
    }
    return Promise.reject(error.response?.data || { message: "Unknown error" });
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (email : string, fullname : string, password : string) => {
    try{
        const response = await api.post("/onBoardingUser", {email, fullname, password});
        return response.data
    }
    catch(err){
        console.log(err);
    }
}

export const login = async (email : string, password : string) => {
  try{
      const response = await api.post("/login", {email, password});
      return response.data
  }
  catch(err){
      console.log(err);
  }  
}

export const addBankAccount = async (email : string, bankAccountNumber : string, bankCode: string) => {
  try{
      const response = await api.post("/addBankAccount", {email, bankAccountNumber, bankCode});
      return response.data
  }
  catch(err){
      console.log(err);
  }  
}

export const getBankAccount = async (email : string) => {
  try{
      const response = await api.post("/getBankAccount", {email});
      return response.data
  }
  catch(err){
      console.log(err);
  }  
}

export const getBankAccountFromDatabase = async (email : string) => {
  try{
      const response = await api.post("/getBankAccountFromDatabase", {email});
      return response.data
  }
  catch(err){
      console.log(err);
  }  
}

export const changeBankAccount = async (email : string, bankAccountNumber : string, bankCode: string) => {
  try{
      const response = await api.post("/changeBankAccount", {email, bankAccountNumber, bankCode});
      return response.data
  }
  catch(err){
      console.log(err);
  }  
}



export const addReceiverToGroup = async (_id : string, originCurrency : string, tokenIcon : string, groupId: string, depositWalletAddress : string, amount : string ) => {
  try{
      const response = await api.post("/addReceiverToGroup", {_id, originCurrency, tokenIcon, groupId, depositWalletAddress, amount});
      return response.data
  }
  catch(err){
      console.log(err);
  }  
}

export const loadAllWithdrawHistory = async (_id : string) => {
  try{
      const response = await api.post("/loadAllWithdrawHistory", {_id});
      return response.data.data
  }
  catch(err){
      console.log(err);
  }  
}

export const loadAllGroupTransactionHistory = async (_id : string) => {
  try{
      const response = await api.post("/loadAllGroupTransactionHistory", {_id});
      return response.data.data
  }
  catch(err){
      console.log(err);
  }  
}
export const deleteGroup = async (_id : string, groupId : string) => {
  try{
      const response = await api.post("/deleteGroup", {_id, groupId});
      return response.data
  }
  catch(err){
      console.log(err);
  }  
}

export const loadSpecifiedGroupTransactionHistory = async (_id : string, groupId : string) => {
  try{
      const response = await api.post("/loadAllGroupTransactionHistory", {_id, groupId});
      return response.data.data
  }
  catch(err){
      console.log(err);
  }  
}

export const loadSpecifiedGroup = async (_id: string, groupId: string): Promise<GroupOfUser | null> => {
  try {
    const response = await api.post("/loadSpecifiedGroupForSender", { _id, groupId });
    return response.data.data as GroupOfUser;
  } catch (err) {
    console.log("Error loading specified group:", err);
    return null;
  }
};

export const loadAllGroup = async (_id : string) => {
  try{
      const response = await api.post("/loadAllGroup", {_id});
      return response.data.data
  }
  catch(err){
      console.log(err);
  }  
}

export const addGroup = async (
  _id: string,
  email: string,
  groupId: string,
  nameOfGroup: string
) => {
  try {
    const response = await api.post("/addGroup", {
      _id,
      email,
      groupId,
      nameOfGroup,
    });
    return response.data; // backend return { message, payroll }
  } catch (err) {
    console.log("Error adding group:", err);
    throw err;
  }
};



export const getUsdcIdrxRate = async () => {
  try{
      const response = await api.post("/getIdrxRateFromUSDC")
      console.log(response)
      return response.data
  }
  catch(err){
      console.log(err);
  }
}

export const logout = async () => {
  const response = await api.post("/logout"); // backend akan hapus cookie
  return response.data.message;
};