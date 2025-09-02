"use client";

import { ReactNode } from "react";
import { useWallet } from "@/lib/walletContext";
import WalletWarning from "./WalletWarning";

interface DashboardWrapperProps {
  children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { isConnected, isLoading } = useWallet();

  // Show loading state while checking wallet connection
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  // Show wallet warning if not connected
  if (!isConnected) {
    return <WalletWarning />;
  }

  // Show dashboard content if wallet is connected
  return <>{children}</>;
}
