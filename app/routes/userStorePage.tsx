import UserStorePage from "~/pages/UserStorePage";

export function meta() {
  return [
    { title: "User landing page" },
    { name: "description", content: "Users landing page" },
  ];
}

export default function NewUserStoreRoute() {
  return <UserStorePage />;
}
