'use client';

import { useState } from 'react';
import { ChevronDown, Wallet, ArrowLeftRight } from 'lucide-react';
import SenderDashboard from '../components/dashboard/SenderDashboard';
import ReceiverDashboard from '../components/dashboard/RecieverDashboard';
import Image from 'next/image';
import { useUser } from '@/lib/userContext';

export default function DashboardPage() {
  const { user, loading, setUser } = useUser();
  if (loading) return <p>Loading...</p>;
  console.log(user)
  // Mock wallets for testing - nanti bisa diganti dengan wallet connection
  const mockWallets = [
    { address: '0x95f...BC70', type: 'sender', label: 'Sender Wallet' },
    { address: 'lexirieru.eth', type: 'receiver', label: 'Receiver Wallet' },
    { address: '0xABC...DEF1', type: 'sender', label: 'Sender Wallet 2' },
    { address: '0x123...456', type: 'receiver', label: 'Receiver Wallet 2' }
  ];

  const [connectedWallet, setConnectedWallet] = useState('0x95f...BC70');
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  
  // Mock data untuk menentukan apakah wallet ini sender atau receiver
  const senderWallets = ['0x95f...BC70', '0xABC...DEF1'];
  const receiverWallets = ['lexirieru.eth', '0x123...456'];
  
  const isSender = senderWallets.includes(connectedWallet);
  const isReceiver = receiverWallets.includes(connectedWallet);
  
  const currentWalletData = mockWallets.find(w => w.address === connectedWallet);
  
  const handleWalletSwitch = (walletAddress: string) => {
    setConnectedWallet(walletAddress);
    setShowWalletDropdown(false);
  };
  
  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                        {/* <div className="absolute inset-0 bg-cyan-400 rounded-lg blur-sm opacity-50"></div> */}
                        <Image 
                          src="/movo non-text.png" 
                          alt="Movo Logo" 
                          width={40} 
                          height={40}
                          className="relative z-10 rounded-lg"
                        />
                      </div>
              <h1 className="text-xl font-bold text-cyan-400">Movo</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/80 text-sm">Base Network</span>
              </div>
              
              {/* Wallet Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="bg-white/10 rounded-lg px-3 py-2 flex items-center space-x-2 hover:bg-white/20 transition-all duration-300"
                >
                  <Wallet className="w-4 h-4 text-white/80" />
                  <div className="flex flex-col items-start">
                    <span className="text-white/80 text-sm font-mono">{connectedWallet}</span>
                    {currentWalletData && (
                      <span className={`text-xs ${currentWalletData.type === 'sender' ? 'text-blue-400' : 'text-green-400'}`}>
                        {currentWalletData.type === 'sender' ? '📤 Sender' : '📥 Receiver'}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${showWalletDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown */}
                {showWalletDropdown && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowWalletDropdown(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl w-72 z-50 max-h-80 overflow-hidden">
                      <div className="p-3 border-b border-white/10">
                        <div className="text-white/60 text-xs font-medium">SWITCH WALLET (FOR TESTING)</div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {mockWallets.map((wallet) => (
                          <button
                            key={wallet.address}
                            onClick={() => handleWalletSwitch(wallet.address)}
                            className={`w-full p-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                              connectedWallet === wallet.address ? 'bg-white/5' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                wallet.type === 'sender' 
                                  ? 'bg-gradient-to-r from-blue-400 to-cyan-500' 
                                  : 'bg-gradient-to-r from-green-400 to-emerald-500'
                              }`}>
                                {wallet.type === 'sender' ? '📤' : '📥'}
                              </div>
                              <div>
                                <div className="text-white text-sm font-mono">{wallet.address}</div>
                                <div className={`text-xs ${wallet.type === 'sender' ? 'text-blue-400' : 'text-green-400'}`}>
                                  {wallet.label}
                                </div>
                              </div>
                            </div>
                            {connectedWallet === wallet.address && (
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <div className="flex items-center justify-center space-x-2 text-white/40 text-xs">
                          <ArrowLeftRight className="w-3 h-3" />
                          <span>Click any wallet to switch view</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isSender && <SenderDashboard onDropdownOpen={() => setShowWalletDropdown(false)} />}
        {isReceiver && <ReceiverDashboard onDropdownOpen={() => setShowWalletDropdown(false)} />}
        {!isSender && !isReceiver && (
          <div className="text-center py-20">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/10">
              <h2 className="text-white text-xl font-semibold mb-4">No Streams Found</h2>
              <p className="text-white/60 mb-6">
                This wallet doesn&apos;t have any active payment streams as sender or receiver.
              </p>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
                Create New Stream
              </button>
              
              {/* Quick Switch Buttons for Testing */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-white/40 text-sm mb-3">Quick Test:</div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleWalletSwitch('0x95f...BC70')}
                    className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    📤 View as Sender
                  </button>
                  <button
                    onClick={() => handleWalletSwitch('lexirieru.eth')}
                    className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                  >
                    📥 View as Receiver
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}