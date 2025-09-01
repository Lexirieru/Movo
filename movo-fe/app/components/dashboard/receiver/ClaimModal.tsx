"use client";

import { useState } from "react";
import { X, Wallet, DollarSign, Coins, ArrowRight } from "lucide-react";
import BankSelector from "./BankSelector";
import BankForm from "./BankForm";
import ClaimSuccess from "./ClaimSuccess";
import { bankDictionary } from "@/lib/dictionary";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStreams: any[];
  totalAmount: number;
}

export default function ClaimModal({
  isOpen,
  onClose,
  selectedStreams,
  totalAmount,
}: ClaimModalProps) {
  const [step, setStep] = useState<"claim" | "selectBank" | "success">("claim");
  const [claimType, setClaimType] = useState<"crypto" | "fiat">("crypto");
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleClaim = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep("success");
    }, 2000);
  };

  const handleConfirmBank = () => {
    console.log("Bank Selected:", bankForm.bankName, bankDictionary[bankForm.bankName]);
    console.log("Account Number:", bankForm.bankAccountNumber);
    console.log("Account Holder:", bankForm.accountHolderName);
    handleClaim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/10">
        <h2 className="text-white text-2xl font-bold">
          {step === "selectBank" ? "Choose Your Bank" : 
           step === "success" ? "Claim Successful" : "Claim Tokens"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {step === "selectBank" ? (
          <BankSelector
            onSelect={handleBankSelect}
            onClose={() => setStep("claim")}
          />
        ) : step === "success" ? (
          <ClaimSuccess 
            amount={totalAmount} 
            claimType={claimType}
            onClose={onClose}
          />
        ) : (
          <div className="p-6">
            <div className="space-y-6 max-w-lg mx-auto">
              {/* Claim Type Switch */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">Claim As:</h3>
                <div className="bg-white/5 rounded-2xl p-2 flex">
                  <button
                    onClick={() => setClaimType('crypto')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      claimType === 'crypto'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Coins className="w-5 h-5" />
                    <span>Cryptocurrency</span>
                  </button>
                  <button
                    onClick={() => setClaimType('fiat')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      claimType === 'fiat'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Fiat Currency</span>
                  </button>
                </div>
              </div>

              {/* Amount Display */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60">You will receive:</span>
                  <span className="text-white/60 text-sm">{selectedStreams.length} stream(s)</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    claimType === 'crypto' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600'
                  }`}>
                    {claimType === 'crypto' ? (
                      <Coins className="w-6 h-6 text-white" />
                    ) : (
                      <DollarSign className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {claimType === 'crypto' 
                        ? `${totalAmount.toFixed(4)} USDC`
                        : `Rp ${(totalAmount * 15850).toLocaleString('id-ID')}`
                      }
                    </div>
                    <div className="text-white/60 text-sm">
                      {claimType === 'crypto' 
                        ? '≈ Rp ' + (totalAmount * 15850).toLocaleString('id-ID')
                        : `From ${totalAmount.toFixed(4)} USDC`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Stream Details */}
              <div className="space-y-3">
                <h4 className="text-white/80 font-medium">Claiming from:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedStreams.map((stream, index) => (
                    <div key={stream.id || index} className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">U</span>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">USDC</div>
                          <div className="text-white/60 text-xs">Stream #{stream.id || index + 1}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crypto Claim Button */}
              {claimType === 'crypto' && (
                <button 
                  onClick={handleClaim}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      <span>Send to Connected Wallet</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {/* Fiat Bank Form */}
              {claimType === 'fiat' && (
                <BankForm
                  bankForm={bankForm}
                  onChange={handleInputChange}
                  onSelectBank={() => setStep("selectBank")}
                  onConfirm={handleConfirmBank}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}