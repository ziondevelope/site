import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeApp } from "firebase/app";

// Firebase configuration 
// Note: In a real implementation, these values should come from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
initializeApp(firebaseConfig);

createRoot(document.getElementById("root")!).render(<App />);
