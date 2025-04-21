import { useEffect, useState } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated") === "true";
      
      // Verificar se a autenticação expirou (opcional - 8 horas)
      const authTimestamp = localStorage.getItem("authTimestamp");
      const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 horas em milissegundos
      
      if (authStatus && authTimestamp) {
        const now = Date.now();
        const lastAuth = parseInt(authTimestamp);
        
        if (now - lastAuth > SESSION_DURATION) {
          // Sessão expirada
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("authTimestamp");
          setIsAuthenticated(false);
          return;
        }
      }
      
      setIsAuthenticated(authStatus);
    };
    
    checkAuth();
  }, []);

  // Estado inicial de carregamento
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Redirecionar para a página de login se não estiver autenticado
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // Renderizar o componente protegido se estiver autenticado
  return <Component />;
}