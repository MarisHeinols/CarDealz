import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import { useAuth } from "./useAuth";
import type { PrivateUserProfileDoc } from "~/services/usersService";
import { migrateLegacyUserDoc } from "~/services/usersService";

const PRIVATE_USERS_COLLECTION = "privateUsers";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PrivateUserProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    migrateLegacyUserDoc(user.uid).catch(() => undefined);
    const unsub = onSnapshot(doc(db, PRIVATE_USERS_COLLECTION, user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as PrivateUserProfileDoc);
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
