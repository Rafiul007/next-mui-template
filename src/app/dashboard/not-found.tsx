import { DashboardStatePage } from "@/components/dashboard/DashboardStatePage";

export default function DashboardNotFound() {
  return (
    <DashboardStatePage
      eyebrow="404 - Not Found"
      title="Dashboard page not found"
      description="The dashboard page you are looking for does not exist or may have been moved."
      mode="notFound"
    />
  );
}
