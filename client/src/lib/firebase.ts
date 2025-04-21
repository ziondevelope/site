import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig, checkEnvironmentConfig } from "@shared/config";

// Verifica se o ambiente está configurado corretamente
const configCheck = checkEnvironmentConfig();
if (!configCheck.isValid) {
  console.warn(`⚠️ AVISO: Algumas variáveis de ambiente estão faltando: ${configCheck.missingVars.join(', ')}`);
  console.warn("Por favor, configure o arquivo .env com base no .env.example");
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore(app);

// Authentication functions
export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

export { auth, storage, firestore, app };
