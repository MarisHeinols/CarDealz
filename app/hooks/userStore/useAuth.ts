import { useContext } from "react";
import { FirebaseAuthContext } from "~/provider/FirebaseAuthProvider";

export const useAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a FirebaseAuthProvider");
  }
  return context;
};