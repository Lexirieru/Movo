// components/Header.tsx
"use client";

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
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex justify-between items-center w-full px-6 py-3 relative z-20">
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* <div className="absolute inset-0 bg-cyan-400 rounded-lg blur-sm opacity-50"></div> */}
          <Image 
            src="/movo full.png" 
            alt="Movo Logo" 
            width={40} 
            height={40}
            className="relative z-10 rounded-lg"
          />
        </div>
      </div>
      
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
    </header>
  );
}