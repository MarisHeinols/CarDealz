import HomePage from "~/pages/HomePage";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BalticAuto - Buy & Sell Cars in the Baltics" },
    { name: "description", content: "The premier car marketplace for Estonia, Latvia, and Lithuania." },
  ];
}

export default function Home() {
  return <HomePage />;
}
