import RegisterUserPage from "~/pages/RegisterUserPage";

export function meta() {
  return [
    { title: "User Registration" },
    { name: "Register", content: "User Registration" },
  ];
}

export default function UserRegistrationRoute() {
  return <RegisterUserPage />;
}
