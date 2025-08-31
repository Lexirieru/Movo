import { addBankAccount, changeBankAccount, deleteBankAccount, getBankAccount, getOrganizationMembers, onBoardingUser} from "../controllers/userGeneralController";

import express, { RequestHandler } from "express";
import { addReceiverToGroup, loadAllGroupTransactionHistory } from "../controllers/userSenderController";
import { loadAllWithdrawHistory } from "../controllers/userReceiverController";

const router = express.Router();

type RouteMethod = "get" | "post" | "put" | "delete";

type RouteDefinition = {
  method: RouteMethod;
  path: string;
  action: RequestHandler;
};

const routes: RouteDefinition[] = [
  // userGeneralController 
  {
    method: "post",
    path: "/onBoardingUser",
    action: onBoardingUser,
  },
  {
    method: "get",
    path: "/getOrganizationMembers",
    action: getOrganizationMembers,
  },
  
  {
    method: "post",
    path: "/addBankAccount",
    action: addBankAccount,
  },
  {
    method: "post",
    path: "/getBankAccount",
    action: getBankAccount,
  },
  {
    method: "post",
    path: "/changeBankAccount",
    action: changeBankAccount,
  },
  {
    method: "post",
    path: "/deleteBankAccount",
    action: deleteBankAccount,
  },

  // userSenderController
  {
    method: "post",
    path: "/addReceiverToGroup",
    action: addReceiverToGroup,
  },
  {
    method: "post",
    path: "/loadAllGroupTransactionHistory",
    action: loadAllGroupTransactionHistory,
  },
  {
    method: "post",
    path: "/loadAllWithdrawHistory",
    action: loadAllWithdrawHistory,
  },
  


//   {
//     method: "post",
//     path: "/loadCompanyTransactionHistory",
//     action: loadCompanyTransactionHistory,
//   },
//   {
//     method: "post",
//     path: "/loadDetailedEmployeeTransactionHistory",
//     action: loadDetailedEmployeeTransactionHistory,
//   },
//   {
//     method: "post",
//     path: "/loadDetailedTransactionHistory",
//     action: loadDetailedTransactionHistory,
//   },
//   {
//     method: "post",
//     path: "/addInvoiceData",
//     action: addInvoiceData,
//   },
  
//   {
//     method: "post",
//     path: "/loadInvoiceData",
//     action: loadInvoiceData,
//   },
//   {
//     method: "post",
//     path: "/addOrUpdateEmployeeData",
//     action: addOrUpdateEmployeeData,
//   },

//   {
//     method: "post",
//     path: "/deleteEmployeeDataFromGroup",
//     action: deleteEmployeeDataFromGroup,
//   },

//   {
//     method: "post",
//     path: "/loadEmployeeDataFromGroup",
//     action: loadEmployeeDataFromGroup,
//   },

//   {
//     method: "post",
//     path: "/addGroupName",
//     action: addGroupName,
//   },

//   {
//     method: "post",
//     path: "/loadGroupName",
//     action: loadGroupName,
//   },

//   {
//     method: "post",
//     path: "/addOrUpdateCompanyStats",
//     action: addOrUpdateCompanyStats,
//   },
//   {
//     method: "post",
//     path: "/addOrUpdateCompanyData",
//     action: addOrUpdateCompanyData,
//   },
];

routes.forEach((route) => {
  router[route.method](route.path, route.action);
});

export default router;
