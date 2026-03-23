import LoginPage from "~/pages/LoginPage";

export function meta() {
  return [
    { title: "Log In | BalticAuto - Car Marketplace" },
    { name: "description", content: "Sign in to your BalticAuto account to manage your listings, communicate with buyers, and save your favorite cars." },
  ];
}

export default function LoginRoute() {
  return <LoginPage />;
}
