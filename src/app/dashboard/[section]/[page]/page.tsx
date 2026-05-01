import { notFound } from "next/navigation";
import { DashboardStatePage } from "@/components/dashboard/DashboardStatePage";
import { getDashboardPlaceholderContent } from "@/config/dashboard-menu";

export default async function DashboardModulePage({
  params,
}: {
  params: Promise<{ section: string; page: string }>;
}) {
  const { section, page } = await params;
  const content = getDashboardPlaceholderContent([section, page]);

  if (!content) {
    notFound();
  }

  return <DashboardStatePage {...content} mode="construction" />;
}
