import LoginPage from "~/pages/LoginPage";

export function meta() {
  return [
    { title: "User Authnetication" },
    { name: "Login", content: "User Authnetication" },
  ];
}

export default function LoginRoute() {
  return <LoginPage />;
}
