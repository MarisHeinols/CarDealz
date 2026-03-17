import StorePage from "~/pages/StorePage";
import { useParams } from "react-router";

export function meta({ params }: { params: { handle: string } }) {
  return [{ title: `Store ${params.handle}` }];
}

export default function StoreRoute() {
  const { handle } = useParams<{ handle: string }>();
  if (!handle) return <div>Not found</div>;
  return <StorePage handle={handle} />;
}

