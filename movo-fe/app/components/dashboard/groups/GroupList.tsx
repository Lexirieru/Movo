import { deleteGroup } from "@/app/api/api";
import { useAuth } from "@/lib/userContext";
import { GroupOfUser } from "@/types/receiverInGroupTemplate";
import { ReceiverInGroup } from "@/types/receiverInGroupTemplate";
import { Users, Send, ArrowRight, Clock, Delete } from "lucide-react";


interface GroupListProps {
  groups: GroupOfUser[];
  onGroupSelect?: (groupId: string) => void;
  isLoading: boolean;
  onGroupDeleted?: () => void; // <-- baru
}

// --- Helper Functions (bisa dipindah ke file utils jika perlu) ---
const getTotalAmount = (receivers: ReceiverInGroup[] | undefined | null): number => {
    if (!Array.isArray(receivers)) return 0;
    return receivers.reduce((acc, r) => acc + (r.amount || 0), 0);
};

const formatDate = (date?: Date | string | null): string => {
    if (!date) return "-";
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (isNaN(parsedDate.getTime())) return "-";
    return new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric", year: "numeric",
    }).format(parsedDate);
};

// --- Komponen Utama ---
interface GroupListProps {
  groups: GroupOfUser[];
  onGroupSelect?: (groupId: string) => void;
  isLoading: boolean;
}

export default function GroupList({ groups, onGroupSelect, isLoading, onGroupDeleted }: GroupListProps) {
  const { user, loading } = useAuth();
  if (isLoading) {
      return <div className="text-center p-12 text-white/60">Loading groups...</div>;
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white/40" />
        </div>
        <div className="text-white/60 mb-2">No groups found</div>
        <div className="text-white/40 text-sm">Create your first payment group to get started.</div>
      </div>
    );
  }

  const handleSelect = (groupId: string) => {
    if (onGroupSelect) {
      onGroupSelect(groupId);
    }
  };
  const handleDeleteGroup = async (groupId: string) => {
    // Tampilkan popup konfirmasi
    const confirmDelete = window.confirm("Are you sure you want to delete this group? This action cannot be undone.");
    if (!confirmDelete) return; // user batal, langsung keluar

    try {
      const groupDeleted = await deleteGroup(user._id, groupId);
      console.log(groupDeleted);
      // Panggil callback setelah sukses delete
      if (onGroupDeleted) onGroupDeleted();
    } catch (err) {
      console.log(err);
      return;
    }
  };



  return (
    <>
      {/* Tampilan Kartu untuk Mobile */}
      <div className="lg:hidden space-y-4">
        {groups.map((group) => (
          <div key={group.groupId} className="bg-white/5 rounded-xl p-4 border border-white/10">
            {/* ... (Salin kode dari Mobile Cards View di file asli) ... */}
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                   <Users className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <div className="text-white font-medium">{group.nameOfGroup}</div>
                   <div className="text-white/60 text-sm">{group.totalRecipients} recipients</div>
                 </div>
               </div>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs">Active</span>
             </div>

             <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                    <div className="text-white/60">Total Amount</div>
                    <div className="text-white font-medium">{getTotalAmount(group.Receivers).toFixed(2)} USDC</div>
                </div>
                <div>
                    <div className="text-white/60">Created</div>
                    <div className="text-white">{formatDate(group.createdAt)}</div>
                </div>
             </div>
             
             <button
               onClick={() => handleSelect(group.groupId)}
               className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
             >
               <Send className="w-4 h-4" />
               <span>Manage Group</span>
               <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>

      {/* Tampilan Tabel untuk Desktop */}
      <div className="hidden lg:block bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* ... (Salin kode dari Desktop Table di file asli) ... */}
            <thead>
                <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-4 text-white/80 font-medium">Group Name</th>
                    <th className="text-left p-4 text-white/80 font-medium">Recipients</th>
                    <th className="text-left p-4 text-white/80 font-medium">Total Amount</th>
                    <th className="text-left p-4 text-white/80 font-medium">Created</th>
                    <th className="text-left p-4 text-white/80 font-medium">Status</th>
                    <th className="text-left p-4 text-white/80 font-medium">Actions</th>
                </tr>
            </thead>
            <tbody>
                {groups.map((group) => (
                    <tr key={group.groupId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">{group.nameOfGroup}</div>
                                    <div className="text-white/60 text-sm">by {group.senderName}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4 text-white font-medium">{group.totalRecipients}</td>
                        <td className="p-4 text-white font-medium">{getTotalAmount(group.Receivers).toFixed(2)} USDC</td>
                        <td className="p-4 text-white/80">{formatDate(group.createdAt)}</td>
                        <td className="p-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-sm">Active</span>
                            </div>
                        </td>
                        <td className="p-4">
                            <button
                                onClick={() => handleSelect(group.groupId)}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteGroup(group.groupId)}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                <Delete className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
