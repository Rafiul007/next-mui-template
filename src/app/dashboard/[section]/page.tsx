import { notFound } from "next/navigation";
import { DashboardStatePage } from "@/components/dashboard/DashboardStatePage";
import { getDashboardPlaceholderContent } from "@/config/dashboard-menu";

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const content = getDashboardPlaceholderContent([section]);

  if (!content) {
    notFound();
  }

  return <DashboardStatePage {...content} mode="construction" />;
}
