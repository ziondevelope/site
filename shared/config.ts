// Configurações centralizadas para o sistema

// Configurações do Firebase
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "your-project-id"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "your-project-id"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "your-app-id"
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
    return !(import.meta.env[varName] || process.env[varName]);
  });
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}