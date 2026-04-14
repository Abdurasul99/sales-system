import { redirect } from "next/navigation";

// AI Agent Monitor page removed — redirects to analytics.
export default function AgentPage() {
  redirect("/analytics");
}
