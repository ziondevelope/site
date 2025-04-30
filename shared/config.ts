// Configurações centralizadas para o sistema

// Verifica se estamos no ambiente do navegador ou do servidor
const isBrowser = typeof window !== 'undefined';

// Configurações do Firebase
export const firebaseConfig = {
  apiKey: isBrowser && import.meta.env.VITE_FIREBASE_API_KEY ? 
    import.meta.env.VITE_FIREBASE_API_KEY : 
    process.env.VITE_FIREBASE_API_KEY || "AIzaSyBIe3S6v12OABxSC7fJCgbONhusqEKYdB4",
  
  authDomain: `${isBrowser && import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
    import.meta.env.VITE_FIREBASE_PROJECT_ID : 
    process.env.VITE_FIREBASE_PROJECT_ID || "projetoimobsite"}.firebaseapp.com`,
  
  projectId: isBrowser && import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
    import.meta.env.VITE_FIREBASE_PROJECT_ID : 
    process.env.VITE_FIREBASE_PROJECT_ID || "projetoimobsite",
  
  storageBucket: `${isBrowser && import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
    import.meta.env.VITE_FIREBASE_PROJECT_ID : 
    process.env.VITE_FIREBASE_PROJECT_ID || "projetoimobsite"}.appspot.com`,
  
  messagingSenderId: isBrowser && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : 
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "659864253826",
  
  appId: isBrowser && import.meta.env.VITE_FIREBASE_APP_ID ? 
    import.meta.env.VITE_FIREBASE_APP_ID : 
    process.env.VITE_FIREBASE_APP_ID || "1:659864253826:web:be28e2b76da214a9d28b9b"
};

// Configurações do servidor
export const serverConfig = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  sessionSecret: process.env.SESSION_SECRET || "imobsite-secret-key",
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || "28800000", 10), // 8 horas em ms
};

// Configurações de autenticação para o frontend
export const authConfig = {
  username: "imobsite",
  password: "Admstation12345",
  sessionDuration: parseInt(process.env.SESSION_TIMEOUT || "28800000", 10), // 8 horas em ms
};

// Configurações para implantação em VPN
export const vpnConfig = {
  domain: process.env.VPN_DOMAIN || "",
  requireHttps: process.env.VPN_REQUIRE_HTTPS === "true",
};

// Função para verificar se o ambiente está configurado corretamente
export function checkEnvironmentConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_APP_ID"
  ];
  
  const missingVars = requiredVars.filter(varName => {
    if (isBrowser) {
      return !import.meta.env[varName];
    } else {
      return !process.env[varName];
    }
  });
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}