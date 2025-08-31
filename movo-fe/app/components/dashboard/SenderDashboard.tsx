"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { useAuth } from '@/lib/userContext';
import { loadAllGroupTransactionHistory } from '@/app/api/api';
import { TransactionHistory } from '@/types/historyTemplate';

import CreateStreamModal from './sender/CreateStreamModal';
import StreamTable from './sender/StreamsTable';

interface Stream {
  id: string;
  token: string;
  tokenIcon: string;
  recipient: string;
  totalAmount: number;
  totalSent: number;
}

interface SenderDashboardProps {
  onDropdownOpen?: () => void;
}

export default function SenderDashboard({ onDropdownOpen }: SenderDashboardProps) {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch dari backend (versi 1)
  useEffect(() => {
    if (loading || !user?._id || hasFetched) return;

    const fetchTransactionHistory = async () => {
      try {
        const historyTemplate = await loadAllGroupTransactionHistory(user._id);

        const mappedStreams: Stream[] = historyTemplate.map((w: TransactionHistory, i: number) => ({
          id: w.txId || `${i}`, // fallback ID
          token: w.originCurrency,
          tokenIcon: '💰',
          recipient: w.senderName || w.to,
          totalAmount: w.totalAmount,
          totalSent: 0, // backend belum kasih totalSent → bisa dihitung sendiri nanti
        }));

        setStreams(mappedStreams);
        setHasFetched(true);
      } catch (err) {
        console.error("Failed to fetch transaction history", err);
      }
    };

    fetchTransactionHistory();
  }, [loading, user, hasFetched]);

  // Filter
  const filteredStreams = streams.filter(
    (stream) =>
      stream.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.token.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleCancelStream = (streamId: string) => {
    setStreams(streams.filter((stream) => stream.id !== streamId));
  };

  const handleCreateStream = (newStream: Stream) => {
    setStreams([newStream, ...streams]);
  };

  // Summary stats
  const totalCommitted = streams.reduce((acc, stream) => acc + stream.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Fixed Streams</h2>
          <p className="text-white/60">
            Start a stream with a fixed start and end date, with automated token distribution.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-2 w-fit hover:scale-105 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">Create A New Fixed Stream</span>
          <span className="sm:hidden">Create Stream</span>
        </button>
      </div>

      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Search streams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={onDropdownOpen}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
          />
        </div>

        
      </div>

      {/* Streams Table */}
      <StreamTable streams={filteredStreams} onCancelStream={handleCancelStream} />
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 hover:scale-105 transition-transform duration-300">
          <h3 className="text-green-300 text-sm font-medium mb-2">Total Committed</h3>
          <p className="text-white text-3xl font-bold mb-1">{totalCommitted.toLocaleString()} IDRX</p>
          <p className="text-white/60 text-sm">Across all streams</p>
        </div>

      </div>

      {/* Create Stream Modal */}
      <CreateStreamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateStream={handleCreateStream}
      />
    </div>
  );
}
