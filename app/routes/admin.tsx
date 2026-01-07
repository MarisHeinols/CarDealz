import AdminDashboardPage from "~/pages/AdminDashboardPage";

export function meta() {
  return [
    { title: "AdminDashboard" },
    { name: "description", content: "AdminDashboard page" },
  ];
}

export default function AdminDashboardRoute() {
  return <AdminDashboardPage />;
}
