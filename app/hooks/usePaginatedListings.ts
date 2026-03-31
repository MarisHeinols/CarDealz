import { useState, useEffect, useCallback, useRef } from "react";
import type { DocumentSnapshot } from "firebase/firestore";
import type { CarListingSummary } from "~/types/types";
import { getPaginatedListings } from "~/services/listingsService";

export function usePaginatedListings(
  pageSize: number = 10, 
  filters?: Partial<CarListingSummary>
) {
  const [listings, setListings] = useState<CarListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  
  // Track cursors for each page to support numbered pagination
  const cursorsRef = useRef<(DocumentSnapshot | null)[]>([null]);

  const fetchPage = useCallback(async (page: number) => {
    if (page === 1) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const cursor = cursorsRef.current[page - 1] || null;
      const result = await getPaginatedListings(pageSize, cursor, filters);
      
      setListings(result.listings);
      setTotalCount(result.totalCount);
      setPageCount(Math.max(1, Math.ceil(result.totalCount / pageSize)));
      
      // Store the cursor for the NEXT page
      if (result.lastVisible) {
        cursorsRef.current[page] = result.lastVisible;
      }
    } catch (err: any) {
      console.error("Error fetching paginated listings:", err);
      setError(err.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize, JSON.stringify(filters)]);

  // Reset when filters or sorting change
  useEffect(() => {
    setListings([]);
    setError(null);
    setTotalCount(0);
    setCurrentPage(1);
    cursorsRef.current = [null];
  }, [JSON.stringify(filters), pageSize]);

  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage, fetchPage]);

  return {
    listings,
    loading,
    refreshing,
    error,
    totalCount,
    currentPage,
    pageCount,
    setCurrentPage,
    refresh: () => fetchPage(currentPage)
  };
}
