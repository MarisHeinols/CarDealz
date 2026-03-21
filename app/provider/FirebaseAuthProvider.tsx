// FirebaseAuthProvider.tsx
import { useState, useEffect, createContext, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "~/firebase/auth";
import { useNavigate, useLocation } from "react-router";
import { Box, CircularProgress, Typography } from "@mui/material";

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
    // Basic timeout to prevent indefinite loading screen
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5s is plenty for auth init

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        clearTimeout(timeout);
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        clearTimeout(timeout);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Initializing Session...</Typography>
      </Box>
    );
  }

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export { FirebaseAuthProvider, FirebaseAuthContext };
