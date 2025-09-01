// app/dashboard/sender/[groupId]/page.tsx
import SenderDashboard from "@/app/components/dashboard/SenderHistoryDashboard";
export default async function SenderGroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  return <SenderDashboard groupId={groupId} />;
}
