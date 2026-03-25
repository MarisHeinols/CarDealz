import React from "react";

type Props = {
  storeUid: string;
  viewerUid: string | null;
  ownerUid: string;
  onStatsChange?: (stats: { avg: number; count: number }) => void;
  useStoreTheme?: boolean;
};

export default function StoreReviewsSection({}: Props) {
  return null;
}
