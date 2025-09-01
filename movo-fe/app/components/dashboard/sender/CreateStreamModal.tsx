"use client";
import { useState } from "react";
import { X, Search } from "lucide-react";
import { ReceiverInGroup, Token } from "@/types/receiverInGroupTemplate";
import { useAuth } from "@/lib/userContext";


interface CreateStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStream: (stream: FormData) => void;
}

interface FormData {
  token: Token | null;
  receiverAddress: string;
  amount: string;
}

// Mock token data untuk demo - dalam implementasi nyata ini akan dari API
const AVAILABLE_TOKENS: Token[] = [
  {
    address: "0x1234...5678",
    symbol: "ETH",
    name: "Ethereum",
    icon: "⟐",
    balance: 2.5
  },
  {
    address: "0xA0b8...1234",
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    balance: 1000
  },
  {
    address: "0x5678...9ABC",
    symbol: "DAI",
    name: "Dai Stablecoin",
    icon: "◈",
    balance: 500
  },
  {
    address: "0x9ABC...DEF0",
    symbol: "USDT",
    name: "Tether USD",
    icon: "₮",
    balance: 750
  }
];

export default function CreateStreamModal({
  isOpen,
  onClose,
  onCreateStream,
}: CreateStreamModalProps) {
  const { user, loading, authenticated } = useAuth(); 
  const [step, setStep] = useState(1); // 1: form, 2: token search
  const [formData, setFormData] = useState<FormData>({
    token: null,
    receiverAddress: "",
    amount: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Token[]>([]);

  const handleTokenSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Filter tokens berdasarkan address, symbol, atau name
      const filtered = AVAILABLE_TOKENS.filter(
        token =>
          token.address.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol.toLowerCase().includes(query.toLowerCase()) ||
          token.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleTokenSelect = (token: Token) => {
    setFormData({ ...formData, token });
    setStep(1);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSubmit = () => {
    if (!formData.token || !formData.receiverAddress || !formData.amount)
      return;
    
    const newStream: ReceiverInGroup = {
      // idnya sender
      _id: user._id,
      // ngambil dari FE
      groupId: Date.now().toString(),
      originCurrency: formData.token,
      tokenIcon: formData.token.icon,
      depositWalletAddress: formData.receiverAddress,
      amount: parseFloat(formData.amount).toString(),
    };
    
    onCreateStream(newStream);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      token: null,
      receiverAddress: "",
      amount: "",
    });
    setStep(1);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Token Search Modal */}
      {step === 2 && (
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-50 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h3 className="text-white text-xl font-semibold">Select Token</h3>
            <button
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by token address, symbol, or name..."
                value={searchQuery}
                onChange={(e) => handleTokenSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {searchQuery.trim() === "" ? (
              <div className="text-center text-gray-400 mt-8">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter token address, symbol, or name to search</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <p>No tokens found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleTokenSelect(token)}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center space-x-4 text-left"
                  >
                    <span className="text-3xl">{token.icon}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{token.symbol}</div>
                      <div className="text-gray-400 text-sm">{token.name}</div>
                      <div className="text-gray-500 text-xs font-mono">
                        {token.address}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {token.balance}
                      </div>
                      <div className="text-gray-400 text-sm">Balance</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Form Modal */}
      {step === 1 && (
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-40 flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h3 className="text-white text-xl font-semibold">Create a Stream</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6 max-w-lg mx-auto">
              {/* Token Selection */}
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Token
                </label>
                <button
                  onClick={() => setStep(2)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors flex items-center justify-between"
                >
                  {formData.token ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{formData.token.icon}</span>
                      <div>
                        <div className="text-white font-medium">
                          {formData.token.symbol}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Balance: {formData.token.balance}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Search and select a token</span>
                  )}
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Receiver Address */}
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Receiver Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={formData.receiverAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      receiverAddress: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Total Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0.0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  />
                  {formData.token && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <span className="text-gray-400">
                        {formData.token.symbol}
                      </span>
                    </div>
                  )}
                </div>
                {formData.token &&
                  formData.amount &&
                  parseFloat(formData.amount) > formData.token.balance && (
                    <p className="text-red-400 text-xs mt-1">
                      Insufficient balance
                    </p>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-white/10 text-white py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    !formData.token ||
                    !formData.receiverAddress ||
                    !formData.amount ||
                    (formData.token && parseFloat(formData.amount) > formData.token.balance)
                  }
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100"
                >
                  Create Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}