"use client";

import { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  Wallet,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useWalletClientHook } from "@/lib/useWalletClient";
import { useWallet } from "@/lib/walletContext";
import { getEscrowByGroupId } from "@/app/api/api";
import {
  topUpFunds,
  checkTokenBalance,
  checkTokenAllowance,
  approveTokens,
} from "@/lib/smartContract";
import { formatTokenAmount, parseTokenAmount } from "@/lib/smartContract";

interface TopupFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export default function TopupFundModal({
  isOpen,
  onClose,
  groupId,
}: TopupFundModalProps) {
  const walletClient = useWalletClientHook();
  const { isConnected, address } = useWallet();
  const [escrowData, setEscrowData] = useState<any>(null);
  const [topupAmount, setTopupAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [tokenAllowance, setTokenAllowance] = useState<string>("0");

  // Load escrow data when modal opens
  useEffect(() => {
    if (isOpen && groupId) {
      loadEscrowData();
    }
  }, [isOpen, groupId]);

  // Check token balance and allowance when escrow data changes
  useEffect(() => {
    if (isConnected && address && escrowData) {
      checkTokenInfo();
    }
  }, [isConnected, address, escrowData]);

  const loadEscrowData = async () => {
    try {
      const data = await getEscrowByGroupId(groupId);
      setEscrowData(data);
    } catch (error) {
      console.error("Error loading escrow data:", error);
      setMessage({
        type: "error",
        text: "Failed to load escrow data. Please try again.",
      });
    }
  };

  const checkTokenInfo = async () => {
    try {
      const balance = await checkTokenBalance(escrowData.tokenType, address!);
      const allowance = await checkTokenAllowance(
        escrowData.tokenType,
        address!,
        escrowData.escrowId,
      );

      setTokenBalance(
        formatTokenAmount(balance, escrowData.tokenType === "USDC" ? 6 : 2),
      );
      setTokenAllowance(
        formatTokenAmount(allowance, escrowData.tokenType === "USDC" ? 6 : 2),
      );
    } catch (error) {
      console.error("Error checking token info:", error);
    }
  };

  const handleTopup = async () => {
    if (!walletClient) {
      setMessage({
        type: "error",
        text: "Wallet client not ready. Please try reconnecting your wallet.",
      });
      return;
    }

    if (!isConnected || !address) {
      setMessage({ type: "error", text: "Please connect your wallet first." });
      return;
    }

    if (!topupAmount.trim() || parseFloat(topupAmount) <= 0) {
      setMessage({
        type: "error",
        text: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    if (!escrowData) {
      setMessage({
        type: "error",
        text: "Escrow data not found. Please try again.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const parsedAmount = parseTokenAmount(
        topupAmount,
        escrowData.tokenType === "USDC" ? 6 : 2,
      );

      // Check if user has enough balance
      const userBalance = await checkTokenBalance(
        escrowData.tokenType,
        address,
      );
      if (userBalance < parsedAmount) {
        throw new Error(
          `Insufficient balance. You have ${formatTokenAmount(userBalance, escrowData.tokenType === "USDC" ? 6 : 2)} ${escrowData.tokenType}`,
        );
      }

      // Check if approval is needed
      const currentAllowance = await checkTokenAllowance(
        escrowData.tokenType,
        address,
        escrowData.escrowId,
      );
      if (currentAllowance < parsedAmount) {
        // Need to approve first
        const approvalSuccess = await approveTokens(
          walletClient,
          escrowData.tokenType,
          escrowData.escrowId,
          parsedAmount,
        );

        if (!approvalSuccess) {
          throw new Error("Failed to approve tokens for escrow contract");
        }
      }

      // Perform topup
      const result = await topUpFunds(
        walletClient,
        escrowData.escrowId,
        parsedAmount,
        escrowData.tokenType,
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: `Topup successful! Added ${topupAmount} ${escrowData.tokenType} to escrow. Transaction: ${result.transactionHash}`,
        });

        // Reset form and refresh data
        setTopupAmount("");
        setTimeout(() => {
          loadEscrowData();
          checkTokenInfo();
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to topup funds");
      }
    } catch (error) {
      console.error("Error topping up funds:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to topup funds. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTopupAmount("");
    setMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-cyan-400/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h3 className="text-white text-xl font-semibold">
              Topup Fund to Escrow
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Add funds to your escrow for receiver withdrawals
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* No Escrow Message */}
            {!escrowData && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 text-yellow-300 mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    No escrow found for this group
                  </span>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm mb-3">
                    To enable topup functionality, you need to:
                  </p>
                  <ol className="text-white/60 text-sm space-y-2 list-decimal list-inside">
                    <li>Enter the group by clicking on the group row</li>
                    <li>Click "Create Escrow Streams" button</li>
                    <li>Fill in receiver details and create escrow</li>
                    <li>Come back here to topup funds</li>
                  </ol>
                </div>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 hover:bg-yellow-500/30 transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {/* Escrow Information - Only show if escrow exists */}
            {/* {escrowData && ( */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
              <h4 className="text-cyan-300 font-medium mb-3">Escrow Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Token Type</p>
                  <p className="text-white font-medium">
                    {escrowData.tokenType}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Escrow ID</p>
                  <p className="text-white font-mono text-xs break-all">
                    {escrowData.escrowId}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Total Allocated</p>
                  <p className="text-white font-medium">
                    {escrowData.totalAmount} {escrowData.tokenType}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Receivers</p>
                  <p className="text-white font-medium">
                    {escrowData.receivers.length} addresses
                  </p>
                </div>
              </div>
            </div>
            {/* )} */}

            {/* Topup Amount Input - Only show if escrow exists */}
            {escrowData && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Topup Amount ({escrowData?.tokenType || "Token"})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all pr-20"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">
                    {escrowData?.tokenType || "Token"}
                  </div>
                </div>
              </div>
            )}

            {/* Token Info - Only show if escrow exists and wallet connected */}
            {isConnected && address && escrowData && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <p className="text-white/60 text-xs mb-1">Your Balance</p>
                  <p className="text-white font-medium">
                    {tokenBalance} {escrowData.tokenType}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Allowance</p>
                  <p className="text-white font-medium">
                    {tokenAllowance} {escrowData.tokenType}
                  </p>
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div
                className={`p-4 rounded-lg border ${
                  message.type === "success"
                    ? "bg-green-500/20 border-green-500/30 text-green-300"
                    : message.type === "error"
                      ? "bg-red-500/20 border-red-500/30 text-red-300"
                      : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.type === "success" && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {message.type === "error" && (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* Submit Button - Only show if escrow exists */}
            {escrowData && (
              <button
                type="button"
                onClick={handleTopup}
                disabled={isLoading || !walletClient || !escrowData}
                className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isLoading || !walletClient || !escrowData
                    ? "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Topup...</span>
                  </>
                ) : !walletClient ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>
                      Wallet client not ready. Please try reconnecting your
                      wallet.
                    </span>
                  </>
                ) : !escrowData ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>Loading escrow data...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    <span>Topup Fund to Escrow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
