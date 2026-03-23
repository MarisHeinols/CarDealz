import HomePage from "~/pages/HomePage";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BalticAuto - Buy & Sell Cars in Estonia, Latvia & Lithuania" },
    { name: "description", content: "The premier car marketplace for the Baltics. Browse thousands of used and new cars for sale in Estonia, Latvia, and Lithuania. List your car for free!" },
    { name: "keywords", content: "cars for sale, used cars baltics, buy cars latvia, cars estonia, cars lithuania, vehicle marketplace, balticauto" },
    { property: "og:title", content: "BalticAuto - Car Marketplace in the Baltics" },
    { property: "og:description", content: "Buy and sell cars easily in Estonia, Latvia, and Lithuania." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function Home() {
  return <HomePage />;
}
