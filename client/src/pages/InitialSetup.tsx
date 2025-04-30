
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function InitialSetup() {
  const [apiKey, setApiKey] = useState("");
  const [projectId, setProjectId] = useState("");
  const [appId, setAppId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Salvar as configurações no localStorage
      localStorage.setItem("VITE_FIREBASE_API_KEY", apiKey);
      localStorage.setItem("VITE_FIREBASE_PROJECT_ID", projectId);
      localStorage.setItem("VITE_FIREBASE_APP_ID", appId);
      localStorage.setItem("ADMIN_USERNAME", username);
      localStorage.setItem("ADMIN_PASSWORD", password);
      localStorage.setItem("INITIAL_SETUP_COMPLETE", "true");

      toast({
        title: "Configuração realizada com sucesso",
        description: "O sistema será reiniciado para aplicar as configurações.",
      });

      // Redirecionar para a página de login
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Configuração Inicial</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Configurações do Firebase</h3>
              <Input
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <Input
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              />
              <Input
                placeholder="App ID"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Credenciais do Corretor</h3>
              <Input
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
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
              {isLoading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
