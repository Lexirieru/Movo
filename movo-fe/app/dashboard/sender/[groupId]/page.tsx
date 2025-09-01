
import SenderDashboard from "@/app/components/dashboard/SenderDashboard";

export default function SenderGroupDetailPage({ params }: { params: { groupId: string } }) {
  return <SenderDashboard groupId={params.groupId} />;
}
