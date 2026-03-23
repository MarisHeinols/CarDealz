import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import { useAuth } from "./useAuth";
import type { UserProfileDoc } from "~/services/usersService";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfileDoc);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error listening to user profile:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return { profile, loading };
}
