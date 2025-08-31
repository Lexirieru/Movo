"use client";

import { useState } from "react";
import { X, Wallet } from "lucide-react";
import BankSelector from "./BankSelector";
import BankForm from "./BankForm";
import ClaimSuccess from "./ClaimSuccess";
import { bankDictionary } from "@/lib/dictionary";

interface ClaimModalProps {
  onClose: () => void;
  claimType: "crypto" | "fiat";
  claimAmount: number;
}

export default function ClaimModal({ onClose, claimType, claimAmount }: ClaimModalProps) {
  const [step, setStep] = useState<"claim" | "selectBank" | "success">("claim");
  const [bankForm, setBankForm] = useState({
    bankName: "",
    bankAccountNumber: "",
    accountHolderName: "",
  });

  const handleBankSelect = (bankName: string) => {
    setBankForm((prev) => ({ ...prev, bankName }));
    setStep("claim");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    console.log("Bank Selected:", bankForm.bankName, bankDictionary[bankForm.bankName]);
    console.log("Account Number:", bankForm.bankAccountNumber);
    console.log("Account Holder:", bankForm.accountHolderName);
    setStep("success");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-white/10">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-white text-2xl font-bold">
            {step === "selectBank" ? "Choose Your Bank" : "Claim Balance"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {step === "selectBank" ? (
          <BankSelector onSelect={handleBankSelect} onClose={() => setStep("claim")} />
        ) : step === "success" ? (
          <ClaimSuccess amount={claimAmount} claimType={claimType} />
        ) : (
          <div className="p-6 space-y-6">
            {/* Amount Display */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-white/60 mb-2">Claim Amount</p>
              <h3 className="text-3xl font-bold text-white mb-1">{claimAmount.toFixed(4)} USDC</h3>
              <p className="text-sm text-gray-400">
                {claimType === "crypto" ? "Will be transferred to your wallet" : "Will be converted to fiat"}
              </p>
            </div>

            {/* Wallet Option */}
            {claimType === "crypto" && (
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2 hover:scale-105">
                <Wallet className="w-5 h-5" />
                <span>Send to Connected Wallet</span>
              </button>
            )}

            {/* Fiat Claim Flow */}
            {claimType === "fiat" && (
              <BankForm
                bankForm={bankForm}
                onChange={handleInputChange}
                onSelectBank={() => setStep("selectBank")}
                onConfirm={handleConfirm}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
