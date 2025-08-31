"use client";

import { useEffect, useState } from 'react';
import { Search, Download, DollarSign, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import ClaimModal from './ClaimModal';
import { useAuth } from '@/lib/userContext';
import { loadAllWithdrawHistory } from '@/app/api/api';
import { WithdrawHistory } from '@/types/historyTemplate';

interface ReceiverDashboardProps {
  onDropdownOpen?: () => void;
}

export default function ReceiverDashboard({ onDropdownOpen }: ReceiverDashboardProps) {
  const { user, loading } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdraws, setSelectedWithdraws] = useState<string[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawHistory[]>([]);


  useEffect(() => {
    if (loading || !user?._id || hasFetched) return;

    const fetchWithdrawHistory = async () => {
      try {
        const historyTemplate = await loadAllWithdrawHistory(user._id);

        const templatesWithdrawHistory: WithdrawHistory[] = historyTemplate.map(
          (w: any) => ({
            withdrawId: w.withdrawId,
            receiverId: w.receiverId,
            amount: w.amount,
            choice: w.choice,
            originCurrency: w.originCurrency,
            targetCurrency: w.targetCurrency ?? "",
            networkChainId: w.networkChainId ?? "",
            walletAddress: w.walletAddress ?? "",
            depositWalletAddress: w.depositWalletAddress ?? "",
            bankId: w.bankId ?? "",
            bankName: w.bankName ?? "",
            bankAccountName: w.bankAccountName ?? "",
            bankAccountNumber: w.bankAccountNumber ?? "",
          })
        );
        setWithdrawHistory(templatesWithdrawHistory);
        setHasFetched(true);
      } catch (err) {
        console.error("Failed to fetch withdraw history", err);
      }
    };

    fetchWithdrawHistory();
  }, [loading, user, hasFetched]);

  // Filter by search
  const filteredWithdraws = withdrawHistory.filter((w) =>
    w.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.choice?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectWithdraw = (withdrawId: string) => {
    setSelectedWithdraws(prev => 
      prev.includes(withdrawId) 
        ? prev.filter(id => id !== withdrawId)
        : [...prev, withdrawId]
    );
  };
  const handleSelectAll = () => {
    // filter hanya withdraw yang withdrawId tidak ada (falsy)
    const selectableWithdraws = filteredWithdraws
      .filter((w) => !w.withdrawId)
      .map((w) => w.withdrawId ?? ""); // tetap pakai fallback string kosong

    if (selectedWithdraws.length === selectableWithdraws.length) {
      setSelectedWithdraws([]);
    } else {
      setSelectedWithdraws(selectableWithdraws);
    }
  };


  const totalSelectedAmount = filteredWithdraws
  .filter(
    (w) => !w.withdrawId && selectedWithdraws.includes(w.withdrawId ?? "")
  )
  .reduce((acc, w) => acc + Number(w.amount), 0);


  const handleClaim = () => {
    if (selectedWithdraws.length > 0) {
      setShowClaimModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Total Fixed Stream</h2>
          <p className="text-white/60">
            Manage your withdraw requests and view your history.
          </p>
        </div>
        
        {selectedWithdraws.length > 0 && (
          <button 
            onClick={handleClaim}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center space-x-2"
          >
            <DollarSign className="w-5 h-5" />
            <span>Claim Selected ({selectedWithdraws.length})</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by bank or choice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={onDropdownOpen}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
          />
        </div>
        
        <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-cyan-400 px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-medium w-12">
                  <input
                    type="checkbox"
                    checked={selectedWithdraws.length === filteredWithdraws.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 text-white/80 font-medium">Token</th>
                <th className="text-left p-4 text-white/80 font-medium">Amount</th>
                <th className="text-left p-4 text-white/80 font-medium">Bank/Chain</th>
                <th className="text-left p-4 text-white/80 font-medium">Wallet Address / Bank Number</th>
                <th className="text-left p-4 text-white/80 font-medium">Transaction ID </th>
                <th className="text-left p-4 text-white/80 font-medium">Type </th>
                <th className="text-left p-4 text-white/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdraws.map((w) => (
                <tr key={w.withdrawId}>
                  <td className="p-4">
                    {!w.withdrawId ? (
                    <input
                      type="checkbox"
                      checked={selectedWithdraws.includes(w.withdrawId ?? "")}
                      onChange={() => handleSelectWithdraw(w.withdrawId ?? "")}
                    />
                  ) : (
                    <span className="text-white/40 text-sm">-</span>
                  )}
                  </td>
                  <td className="p-4 text-white">{w.originCurrency} </td>
                  <td className="p-4 text-white">{w.amount}</td>
                  <td className="p-4 text-white">{w.bankName || w.networkChainId || "-" }</td>
                  <td className="p-4 text-white">{w.bankAccountNumber || w.walletAddress || "-"}</td>
                  <td className="p-4 text-white">{w.withdrawId || "-"}</td>
                  <td className="p-4 text-white">{w.choice || "-"}</td>
                  <td className="p-4">
                  {!w.withdrawId ? (
                    <button
                      onClick={() => {
                        setSelectedWithdraws([w.withdrawId ?? ""]);
                        setShowClaimModal(true);
                      }}
                      className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-white/40 text-sm">Withdraw Completed</span>
                  )}
                </td>   
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWithdraws.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/40 mb-2">No withdraws found</div>
            <div className="text-white/60 text-sm">No withdraw history available</div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h3 className="text-green-300 text-sm font-medium">Total Selected</h3>
          </div>
          <p className="text-white text-2xl font-bold">{totalSelectedAmount.toFixed(2)}</p>
          <p className="text-white/60 text-sm mt-1">Ready to claim</p>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          isOpen={showClaimModal}
          onClose={() => {
            setShowClaimModal(false);
            setSelectedWithdraws([]);
          }}
          selectedStreams={withdrawHistory.filter(w => selectedWithdraws.includes(w.withdrawId ?? ""))}
          totalAmount={totalSelectedAmount}
        />
      )}
    </div>

    
  );

  
}
