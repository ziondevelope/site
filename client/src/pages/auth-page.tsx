import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row rounded-lg overflow-hidden shadow-xl">
        {/* Coluna da esquerda - Formulário */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Área Administrativa</h2>
              <p className="text-gray-600">Faça login para acessar o sistema.</p>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>
            </form>

            <div className="mt-8">
              <p className="text-sm text-gray-500 text-center">
                Para acessar a área pública, <a href="/" className="text-blue-600 hover:underline">clique aqui</a>.
              </p>
            </div>
          </div>
        </div>
        
        {/* Coluna da direita - Hero Section */}
        <div className="hidden md:block md:w-1/2 bg-indigo-700 p-12 text-white">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Sistema de Gestão Imobiliária</h2>
            <p className="mb-6">
              Gerencie seus imóveis, leads e depoimentos em um único lugar. 
              Nossa plataforma oferece todas as ferramentas necessárias para 
              administrar seu negócio imobiliário de forma eficiente.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Gestão completa de imóveis
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Acompanhamento de leads
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Análise de desempenho em tempo real
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Personalização do website
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}