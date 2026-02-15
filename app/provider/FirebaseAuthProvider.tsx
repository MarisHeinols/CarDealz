// FirebaseAuthProvider.tsx
import { useState, useEffect, createContext, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "~/firebase/auth";
import { useNavigate, useLocation } from "react-router";

type ContextState = { user: User | null };
const FirebaseAuthContext = createContext<ContextState | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const value = { user };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location]);

  if (loading) return <div>Loading...</div>;

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export { FirebaseAuthProvider, FirebaseAuthContext };
