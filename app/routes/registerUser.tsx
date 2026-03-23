import RegisterUserPage from "~/pages/RegisterUserPage";

export function meta() {
  return [
    { title: "Create Your Account | BalticAuto" },
    { name: "description", content: "Join BalticAuto today to start buying or selling vehicles across the Baltic states. Free registration for individuals and business plans for dealers." },
  ];
}

export default function UserRegistrationRoute() {
  return <RegisterUserPage />;
}
