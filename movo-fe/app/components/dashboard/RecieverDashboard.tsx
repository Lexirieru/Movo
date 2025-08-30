import { useState } from 'react';
import { Search, Download, DollarSign, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import ClaimModal from './ClaimModal';

interface Stream {
  id: string;
  token: string;
  tokenIcon: string;
  funder: string;
  totalAmount: number;
  totalVested: number;
  claimed: number;
  withdrawable: number;
  status: 'Active' | 'Paused' | 'Completed';
  rate: number;
}

interface ReceiverDashboardProps {
  onDropdownOpen?: () => void;
}

export default function ReceiverDashboard({ onDropdownOpen }: ReceiverDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  
  const streams: Stream[] = [
    {
      id: '1',
      token: 'IDRX',
      tokenIcon: '🇮🇩',
      funder: '0x95f...BC70',
      totalAmount: 100,
      totalVested: 0,
      claimed: 0,
      withdrawable: 7.58,
      status: 'Active',
      rate: 3.33333
    },
    {
      id: '2',
      token: 'IDRX', 
      tokenIcon: '🇮🇩',
      funder: '0x95f...BC70',
      totalAmount: 100,
      totalVested: 0,
      claimed: 0,
      withdrawable: 32.49,
      status: 'Active',
      rate: 14.28571
    }
  ];

  const filteredStreams = streams.filter(stream =>
    stream.funder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stream.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectStream = (streamId: string) => {
    setSelectedStreams(prev => 
      prev.includes(streamId) 
        ? prev.filter(id => id !== streamId)
        : [...prev, streamId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStreams.length === filteredStreams.length) {
      setSelectedStreams([]);
    } else {
      setSelectedStreams(filteredStreams.map(stream => stream.id));
    }
  };

  const totalWithdrawable = filteredStreams
    .filter(stream => selectedStreams.includes(stream.id))
    .reduce((acc, stream) => acc + stream.withdrawable, 0);

  const handleClaim = () => {
    if (selectedStreams.length > 0) {
      setShowClaimModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">All Fixed Streams</h2>
          <p className="text-white/60">
            View and manage your incoming payment streams from various senders.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedStreams.length > 0 && (
            <button 
              onClick={handleClaim}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center space-x-2"
            >
              <DollarSign className="w-5 h-5" />
              <span>Claim Selected ({selectedStreams.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
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

      {/* Bulk Actions */}
      {filteredStreams.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStreams.length === filteredStreams.length}
                onChange={handleSelectAll}
                className="w-4 h-4 bg-white/10 border border-white/30 rounded focus:ring-2 focus:ring-cyan-500/50"
              />
              <span className="text-white/80 text-sm">Select All</span>
            </label>
            {selectedStreams.length > 0 && (
              <span className="text-cyan-400 text-sm">
                {selectedStreams.length} stream(s) selected
              </span>
            )}
          </div>
          
          {selectedStreams.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-white/60 text-sm">
                Total: {totalWithdrawable.toFixed(4)} IDRX
              </span>
              <button 
                onClick={handleClaim}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              >
                Claim All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Streams Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-medium w-12">
                  <input
                    type="checkbox"
                    checked={selectedStreams.length === filteredStreams.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 bg-white/10 border border-white/30 rounded focus:ring-2 focus:ring-cyan-500/50"
                  />
                </th>
                <th className="text-left p-4 text-white/80 font-medium">Token</th>
                <th className="text-left p-4 text-white/80 font-medium">Funder/Recipient</th>
                <th className="text-left p-4 text-white/80 font-medium">Total Amount</th>
                <th className="text-left p-4 text-white/80 font-medium">Total Vested</th>
                <th className="text-left p-4 text-white/80 font-medium">Claimed</th>
                <th className="text-left p-4 text-white/80 font-medium">Withdrawable</th>
                <th className="text-left p-4 text-white/80 font-medium">Status</th>
                <th className="text-left p-4 text-white/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStreams.map((stream) => (
                <tr key={stream.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedStreams.includes(stream.id)}
                      onChange={() => handleSelectStream(stream.id)}
                      className="w-4 h-4 bg-white/10 border border-white/30 rounded focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">I</span>
                      </div>
                      <span className="text-white font-medium">{stream.token}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-white/80 font-mono text-sm">{stream.funder}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{stream.totalAmount}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{stream.totalVested}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{stream.claimed}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-green-400 font-medium">{stream.withdrawable}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 text-sm">
                        Vesting {stream.rate}/day
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedStreams([stream.id]);
                          setShowClaimModal(true);
                        }}
                        className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        disabled={stream.withdrawable === 0}
                      >
                        Claim
                      </button>
                      <button className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
                        Chart
                      </button>
                      <button className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg text-sm hover:bg-purple-500/30 transition-colors">
                        Contract
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4 p-4">
          {filteredStreams.map((stream) => (
            <div key={stream.id} className="bg-white/10 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedStreams.includes(stream.id)}
                    onChange={() => handleSelectStream(stream.id)}
                    className="w-4 h-4 bg-white/10 border border-white/30 rounded focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">I</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{stream.token}</div>
                    <div className="text-white/60 text-sm font-mono">{stream.funder}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-green-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-white/60 text-xs mb-1">Total Amount</div>
                  <div className="text-white">{stream.totalAmount}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Withdrawable</div>
                  <div className="text-green-400 font-medium">{stream.withdrawable}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Claimed</div>
                  <div className="text-white">{stream.claimed}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Rate</div>
                  <div className="text-white/80 text-sm">{stream.rate}/day</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setSelectedStreams([stream.id]);
                    setShowClaimModal(true);
                  }}
                  className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg text-sm hover:bg-green-500/30 transition-colors flex items-center justify-center space-x-1"
                  disabled={stream.withdrawable === 0}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Claim</span>
                </button>
                <button className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm hover:bg-blue-500/30 transition-colors flex items-center justify-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Chart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/40 mb-2">No streams found</div>
            <div className="text-white/60 text-sm">No incoming payment streams available</div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h3 className="text-green-300 text-sm font-medium">Total Withdrawable</h3>
          </div>
          <p className="text-white text-2xl font-bold">
            {streams.reduce((acc, stream) => acc + stream.withdrawable, 0).toFixed(2)} IDRX
          </p>
          <p className="text-white/60 text-sm mt-1">Ready to claim</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-blue-300 text-sm font-medium">Total Expected</h3>
          </div>
          <p className="text-white text-2xl font-bold">
            {streams.reduce((acc, stream) => acc + stream.totalAmount, 0)} IDRX
          </p>
          <p className="text-white/60 text-sm mt-1">Across all streams</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-300 text-sm font-medium">Total Claimed</h3>
          </div>
          <p className="text-white text-2xl font-bold">
            {streams.reduce((acc, stream) => acc + stream.claimed, 0)} IDRX
          </p>
          <p className="text-white/60 text-sm mt-1">Already withdrawn</p>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-cyan-300 text-sm font-medium">Daily Rate</h3>
          </div>
          <p className="text-white text-2xl font-bold">
            {streams.reduce((acc, stream) => acc + stream.rate, 0).toFixed(2)}/day
          </p>
          <p className="text-white/60 text-sm mt-1">Total vesting rate</p>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          isOpen={showClaimModal}
          onClose={() => {
            setShowClaimModal(false);
            setSelectedStreams([]);
          }}
          selectedStreams={streams.filter(stream => selectedStreams.includes(stream.id))}
          totalAmount={totalWithdrawable}
        />
      )}
    </div>
  );
}