import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logoImage from "../assets/logo-dark.png";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const authTimestamp = localStorage.getItem("authTimestamp");
    const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 horas em milissegundos
    
    if (isAuthenticated && authTimestamp) {
      const now = Date.now();
      const lastAuth = parseInt(authTimestamp);
      
      // Verificar se a sessão ainda é válida
      if (now - lastAuth <= SESSION_DURATION) {
        // Redirecionar para a área administrativa
        setLocation("/admin");
      } else {
        // Sessão expirada, limpar localStorage
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("authTimestamp");
      }
    }
  }, []);

  // Credenciais fixas conforme solicitado
  const FIXED_USERNAME = "imobsite";
  const FIXED_PASSWORD = "Admstation12345";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verificar as credenciais fixas
    if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
      // Armazenar estado de autenticação no localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authTimestamp", Date.now().toString());
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo(a) à área administrativa.",
        variant: "default",
      });
      
      // Redirecionar para o dashboard
      setLocation("/admin");
    } else {
      // Mostrar mensagem de erro
      toast({
        title: "Erro de autenticação",
        description: "Usuário ou senha incorretos. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md py-12 px-8 sm:px-10 rounded-lg shadow-xl bg-white border border-gray-100">
        <div className="flex flex-col items-center mb-12">
          <img 
            src={logoImage} 
            alt="Imobsite" 
            className="w-64 mb-8"
          />
          <p className="text-gray-500 text-center">Acesse a área administrativa</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="username"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                required
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                required
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full py-6 text-lg bg-[#00456A] hover:bg-[#003A57] transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Autenticando...
              </div>
            ) : "Entrar"}
          </Button>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">
              Para acessar a área pública, <a href="/" className="text-[#00456A] hover:text-[#003A57] font-medium hover:underline transition-colors">clique aqui</a>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}