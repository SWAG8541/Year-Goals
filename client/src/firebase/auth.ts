import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./config";

export const signInWithGoogle = async () => {
  const { user } = await signInWithPopup(auth, googleProvider);
  return { idToken: await user.getIdToken() };
};
