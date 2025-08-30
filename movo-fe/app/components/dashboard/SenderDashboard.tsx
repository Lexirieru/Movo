import { useState } from 'react';
import { Plus, Search, Download, Pause, X, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface Stream {
  id: string;
  token: string;
  tokenIcon: string;
  recipient: string;
  totalAmount: number;
  totalSent: number;
  withdrawable: number;
  status: 'Active' | 'Paused' | 'Completed';
  rate: number;
}

interface SenderDashboardProps {
  onDropdownOpen?: () => void;
}

export default function SenderDashboard({ onDropdownOpen }: SenderDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const streams: Stream[] = [
    {
      id: '1',
      token: 'IDRX',
      tokenIcon: '🇮🇩',
      recipient: 'lexirieru.eth',
      totalAmount: 100,
      totalSent: 0,
      withdrawable: 7.73,
      status: 'Active',
      rate: 3.33333
    },
    {
      id: '2',
      token: 'IDRX',
      tokenIcon: '🇮🇩',
      recipient: 'lexirieru.eth',
      totalAmount: 100,
      totalSent: 0,
      withdrawable: 33.16,
      status: 'Active',
      rate: 14.28571
    }
  ];

  const filteredStreams = streams.filter(stream =>
    stream.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stream.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Clock className="w-4 h-4 text-green-400" />;
      case 'Paused':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handlePauseStream = (streamId: string) => {
    console.log('Pausing stream:', streamId);
  };

  const handleCancelStream = (streamId: string) => {
    console.log('Cancelling stream:', streamId);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Fixed Streams</h2>
          <p className="text-white/60">
            Start a stream with a fixed start and end date, with the possibility of adding a cliff.
          </p>
        </div>
        
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-2 w-fit">
          <Plus className="w-5 h-5" />
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

      {/* Streams Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-medium">Token</th>
                <th className="text-left p-4 text-white/80 font-medium">Recipient</th>
                <th className="text-left p-4 text-white/80 font-medium">Total Amount</th>
                <th className="text-left p-4 text-white/80 font-medium">Total Sent</th>
                <th className="text-left p-4 text-white/80 font-medium">Withdrawable</th>
                <th className="text-left p-4 text-white/80 font-medium">Status</th>
                <th className="text-left p-4 text-white/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStreams.map((stream) => (
                <tr key={stream.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">I</span>
                      </div>
                      <span className="text-white font-medium">{stream.token}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-white/80 font-mono text-sm">{stream.recipient}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{stream.totalAmount}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{stream.totalSent}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-medium">{stream.withdrawable}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(stream.status)}
                      <span className="text-white/80 text-sm">
                        Sending {stream.rate}/day
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handlePauseStream(stream.id)}
                        className="bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors flex items-center space-x-1"
                      >
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                      </button>
                      <button 
                        onClick={() => handleCancelStream(stream.id)}
                        className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/30 transition-colors flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
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
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">I</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{stream.token}</div>
                    <div className="text-white/60 text-sm font-mono">{stream.recipient}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(stream.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-white/60 text-xs mb-1">Total Amount</div>
                  <div className="text-white">{stream.totalAmount}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Withdrawable</div>
                  <div className="text-white font-medium">{stream.withdrawable}</div>
                </div>
              </div>
              
              <div className="text-white/80 text-sm mb-4">
                Sending {stream.rate}/day
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePauseStream(stream.id)}
                  className="flex-1 bg-yellow-500/20 text-yellow-400 py-2 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors flex items-center justify-center space-x-1"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
                <button 
                  onClick={() => handleCancelStream(stream.id)}
                  className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/40 mb-2">No streams found</div>
            <div className="text-white/60 text-sm">Try adjusting your search terms or create a new stream</div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20">
          <h3 className="text-cyan-300 text-sm font-medium mb-2">Active Streams</h3>
          <p className="text-white text-2xl font-bold">
            {streams.filter(s => s.status === 'Active').length}
          </p>
          <p className="text-white/60 text-sm mt-1">Currently running</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-green-300 text-sm font-medium mb-2">Total Committed</h3>
          <p className="text-white text-2xl font-bold">
            {streams.reduce((acc, stream) => acc + stream.totalAmount, 0)} IDRX
          </p>
          <p className="text-white/60 text-sm mt-1">Across all streams</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-purple-300 text-sm font-medium mb-2">Daily Rate</h3>
          <p className="text-white text-2xl font-bold">
            {streams.reduce((acc, stream) => acc + stream.rate, 0).toFixed(2)}/day
          </p>
          <p className="text-white/60 text-sm mt-1">Total sending rate</p>
        </div>
      </div>
    </div>
  );
}