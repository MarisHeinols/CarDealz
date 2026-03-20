import VerifyPhonePage from "~/pages/VerifyPhonePage";

export function meta() {
  return [
    { title: "Verify Phone" },
    { name: "Verify Phone", content: "Phone verification" },
  ];
}

export default function VerifyPhoneRoute() {
  return <VerifyPhonePage />;
}
