"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Clock,
  CheckCircle2,
  Wallet,
  Filter,
} from "lucide-react";
import { useAuth } from "@/lib/userContext";
import { loadSpecifiedGroup, removeReceiverDataFromGroup } from "@/app/api/api";
import { GroupOfUser, ReceiverInGroup } from "@/types/receiverInGroupTemplate";
import CreateStreamModal from "./sender/CreateStreamModal";

interface Stream {
  _id: string;
  token: string;
  tokenIcon: string;
  recipient: string;
  fullname? : string;
  totalAmount: number;
  totalSent: number;
}

interface SenderDashboardProps {
  groupId: string;
  onDropdownOpen?: () => void;
}

export default function SenderDashboard({
  groupId,
  onDropdownOpen,
}: SenderDashboardProps) {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0); // 🔑 trigger ulang useEffect

  const [filterType, setFilterType] = useState<"all" | "pending" | "completed">(
    "all"
  );

  useEffect(() => {
    if (loading || !user?._id || hasFetched) return;

    const fetchGroupStreams = async () => {
      try {
        const group: GroupOfUser | null = await loadSpecifiedGroup(
          user._id,
          groupId
        );

        if (!group) return;

        const mappedStreams: Stream[] = (group.Receivers || []).map(
          (receiver: ReceiverInGroup, i: number) => ({
            _id: receiver._id || `${i}`,
            token:
              typeof receiver.originCurrency === "string"
                ? receiver.originCurrency
                : receiver.originCurrency || "USDC",
            tokenIcon: "💰",
            recipient: receiver.depositWalletAddress || "Unknown",
            fullname: receiver.fullname || "Unknown",
            totalAmount: receiver.amount || 0,
            totalSent: 0,
          })
        );

        setStreams(mappedStreams);
        setHasFetched(true);
      } catch (err) {
        console.error("Failed to fetch specified group streams", err);
      }
    };

    fetchGroupStreams();
  }, [loading, user, hasFetched, groupId, refreshFlag]);
  const handleRefund = async (id : string) => {
    const confirmRefund = window.confirm("Are you sure you want to refund from this person? This action cannot be undone.");
    if (!confirmRefund) return; // user batal, langsung keluar

    // try {
    //   const groupDeleted = await deleteGroup(user._id, groupId);
    //   console.log(groupDeleted);
    //   // Panggil callback setelah sukses delete
    //   if (onGroupDeleted) onGroupDeleted();
    // } catch (err) {
    //   console.log(err);
    //   return;
    // }
  }

  const handleRemove = async (receiverId : string) => {
    const confirmRemove = window.confirm("Are you sure you want to remove this person from the group? This action cannot be undone.");
    if (!confirmRemove) return; // user batal, langsung keluar
    console.log(receiverId)
    try {
      console.log(user)
      const groupDeleted = await removeReceiverDataFromGroup(user._id, groupId, receiverId );
      console.log(groupDeleted);
      // Panggil callback setelah sukses delete
      // if (onGroupDeleted) onGroupDeleted();
    } catch (err) {
      console.log(err);
      return;
    }
  }
  // Filter streams
  const filteredStreams = streams.filter((s) => {
    const matchesSearch =
      s.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.token.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all"
        ? true
        : filterType === "pending"
        ? s.totalSent < s.totalAmount
        : filterType === "completed"
        ? s.totalSent >= s.totalAmount
        : true;

    return matchesSearch && matchesFilter;
  });

  const totalCommitted = streams.reduce(
    (acc, s) => acc + s.totalAmount,
    0
  );
  const completedCount = streams.filter((s) => s.totalSent >= s.totalAmount)
    .length;
  const pendingCount = streams.filter((s) => s.totalSent < s.totalAmount).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Fixed Streams
            </h2>
            <p className="text-white/60">
              Start a stream with a fixed start and end date, with automated
              token distribution.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-2 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Stream</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{pendingCount}</div>
                <div className="text-white/60 text-sm">Pending Streams</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{completedCount}</div>
                <div className="text-white/60 text-sm">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {totalCommitted.toLocaleString()}
                </div>
                <div className="text-white/60 text-sm">Total Committed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={onDropdownOpen}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as "all" | "pending" | "completed"
                )
              }
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="all">All Streams</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Streams List (Mobile Cards) */}
        <div className="lg:hidden space-y-4">
          {filteredStreams.map((s) => (
            <div
              key={s._id}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{s.recipient}</div>
                  <div className="text-white font-medium">{s.fullname}</div>
                  <div className="text-white/60 text-sm">{s.token}</div>
                </div>
                <div>
                  {s.totalSent >= s.totalAmount ? (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs">
                      Completed
                    </span>
                  ) : (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg text-xs">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="text-white text-sm">
                Amount: {s.totalAmount} {s.token}
              </div>
            </div>
          ))}
        </div>

        {/* Streams Table (Desktop) */}
        <div className="hidden lg:block bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left p-4 text-white/80 font-medium">
                    Recipient Address
                  </th>
                  <th className="text-left p-4 text-white/80 font-medium">
                    Recipient Name
                  </th>
                  <th className="text-left p-4 text-white/80 font-medium">
                    Token
                  </th>
                  <th className="text-left p-4 text-white/80 font-medium">
                    Amount
                  </th>
                  <th className="text-left p-4 text-white/80 font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStreams.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-white">{s.recipient}</td>
                    <td className="p-4 text-white">{s.fullname}</td>
                    <td className="p-4 text-white">{s.token}</td>
                    <td className="p-4 text-white">{s.totalAmount}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleRefund(s._id)} // panggil fungsi refund
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        Refund
                      </button>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleRemove(s._id)} // panggil fungsi refund
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredStreams.length === 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
            <div className="text-white/60 mb-2">No streams found</div>
            <div className="text-white/40 text-sm">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : "No streams available in this group"}
            </div>
          </div>
        )}
      </div>

      {/* Create Stream Modal */}
      <CreateStreamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateStream={(newReceiver) => {
          const mapped: Stream = {
            _id: newReceiver._id,
            token:
              typeof newReceiver.originCurrency === "string"
                ? newReceiver.originCurrency
                : newReceiver.originCurrency,
            tokenIcon: newReceiver.tokenIcon || "💰",
            recipient: newReceiver.depositWalletAddress,
            totalAmount: newReceiver.amount,
            totalSent: 0,
          };
          setStreams((prev) => [mapped, ...prev]);
        }}
      />
    </div>
  );
}