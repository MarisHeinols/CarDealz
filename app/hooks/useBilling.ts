import { useEffect, useState } from "react";
import { auth } from "~/firebase/auth";
import { getUserProfile, type UserProfileDoc } from "~/services/usersService";
import { BILLING_ENABLED, INACTIVE_BILLING_STATUSES } from "~/config/billing";
import { onAuthStateChanged } from "firebase/auth";

export function useBilling() {
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        getUserProfile(user.uid).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const isBillingActive = !BILLING_ENABLED || (profile?.billing?.status === "active");
  const isBillingOverdue = BILLING_ENABLED && profile?.billing?.status && INACTIVE_BILLING_STATUSES.includes(profile.billing.status);

  return { 
    profile, 
    loading, 
    isBillingActive, 
    isBillingOverdue,
    billingStatus: profile?.billing?.status 
  };
}
