"use client";

import { useState } from "react";
import Image from "next/image";
import SenderDashboard from "../components/dashboard/SenderDashboard";
import ReceiverDashboard from "../components/dashboard/RecieverDashboard";

// OnchainKit Wallet Components
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";

export default function DashboardPage() {
  // 🔥 Mock state untuk sementara
  const [address, setAddress] = useState("0x123..."); // default mock address

  // Dummy role mapping
  const senderAddresses = ["0x123...", "0xabc..."];
  const receiverAddresses = ["0x456...", "0xdef..."];

  let role: "sender" | "receiver" | "unknown" = "unknown";
  if (address) {
    if (senderAddresses.includes(address)) role = "sender";
    else if (receiverAddresses.includes(address)) role = "receiver";
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image
              src="/movo non-text.png"
              alt="Movo Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-xl font-bold text-cyan-400">Movo</h1>
          </div>

          {/* Wallet Connect */}
          <Wallet className="z-30">
            <ConnectWallet className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-6 py-2 rounded-full border border-cyan-400/30 shadow-lg shadow-cyan-500/25 transition-all duration-300">
              <span className="font-semibold px-2">Get Started!</span>
              <Name className="text-inherit" />
            </ConnectWallet>
            <WalletDropdown className="bg-gray-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-xl shadow-2xl shadow-cyan-500/10">
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <div className="flex flex-col text-white">
                  <Name />
                  <Address />
                  <EthBalance />
                </div>
              </Identity>
              <WalletDropdownDisconnect className="text-red-400 hover:bg-red-500/10" />
            </WalletDropdown>
          </Wallet>

          {/* Quick Switch (Testing Only) */}
          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={() => setAddress("0x123...")}
              className="px-3 py-1 bg-blue-600 rounded-md text-sm text-white"
            >
              📤 Sender
            </button>
            <button
              onClick={() => setAddress("0x456...")}
              className="px-3 py-1 bg-green-600 rounded-md text-sm text-white"
            >
              📥 Receiver
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        {role === "sender" && <SenderDashboard />}
        {role === "receiver" && <ReceiverDashboard />}
        {role === "unknown" && (
          <p className="text-gray-400 text-center mt-20">
            Wallet not recognized. Please contact admin 🔒
          </p>
        )}
      </div>
    </section>
  );
}
