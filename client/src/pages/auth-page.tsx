import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logoImage from "../assets/logo.png";

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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logoImage} 
            alt="Imobsite" 
            className="h-24 mb-6"
          />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Input
              id="username"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <Input
              id="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Autenticando..." : "Entrar"}
          </Button>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 text-center">
              Para acessar a área pública, <a href="/" className="text-blue-600 hover:underline">clique aqui</a>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}