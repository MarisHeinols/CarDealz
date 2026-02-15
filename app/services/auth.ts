import { auth } from "~/firebase/auth";
import { db } from "../firebase/fireStore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router";

export const registerUser = async (
  email: string,
  password: string,
  userData: any,
  role: "individual" | "business"
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    role,
    ...userData,
    createdAt: new Date(),
  });

  return cred;
};


export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export const login = async (email:string,password:string) => {
    const navigate = useNavigate();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      alert(err.message);
    }
  };