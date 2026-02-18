import PleaseLogin from "~/components/shared/PleaseLogin";
import { useAuth } from "~/hooks/userStore/useAuth";
import NewListingPage from "~/pages/NewListingPage";

export function meta() {
  return [
    { title: "Create New Listing" },
    { name: "description", content: "Create a new car listing" },
  ];
}

export default function NewListingRoute() {
  const { user } = useAuth();
  if (!user) {
    return <PleaseLogin />;
  }
  return <NewListingPage />;
}
