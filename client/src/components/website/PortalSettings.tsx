import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PortalSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function PortalSettings({
  config,
  configData,
  onConfigChange
}: PortalSettingsProps) {
  const [activePortalTab, setActivePortalTab] = useState("vivareal");
  const [testStatus, setTestStatus] = useState<"none" | "success" | "error">("none");
  const { toast } = useToast();

  // Exemplos de portais que podem ser integrados
  const portals = [
    { id: "vivareal", name: "Viva Real" },
    { id: "zap", name: "ZAP Imóveis" },
    { id: "imovelweb", name: "Imóvel Web" },
    { id: "quintoandar", name: "Quinto Andar" },
    { id: "outros", name: "Outros portais" }
  ];

  const handleTestConnection = () => {
    // Simulando um teste de conexão
    toast({
      title: "Testando conexão",
      description: "Aguarde enquanto testamos a conexão com o portal...",
    });
    
    // Simula um tempo de processamento
    setTimeout(() => {
      // Aleatoriamente define sucesso ou erro para demonstração
      const isSuccess = Math.random() > 0.3;
      setTestStatus(isSuccess ? "success" : "error");
      
      toast({
        title: isSuccess ? "Conexão bem-sucedida" : "Falha na conexão",
        description: isSuccess 
          ? "Sua conexão com o portal foi estabelecida com sucesso." 
          : "Não foi possível estabelecer conexão. Verifique suas credenciais.",
        variant: isSuccess ? "default" : "destructive",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Portal</CardTitle>
          <CardDescription>
            Configure a integração com portais de imóveis para sincronizar seus imóveis automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activePortalTab} onValueChange={setActivePortalTab}>
            <TabsList className="mb-4">
              {portals.map(portal => (
                <TabsTrigger key={portal.id} value={portal.id}>
                  {portal.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {portals.map(portal => (
              <TabsContent key={portal.id} value={portal.id} className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor={`${portal.id}-enabled`} className="flex items-center gap-2">
                      <Switch 
                        id={`${portal.id}-enabled`} 
                        checked={configData[`${portal.id}Enabled` as keyof typeof configData] as boolean || false}
                        onCheckedChange={(checked) => 
                          onConfigChange({ [`${portal.id}Enabled`]: checked })
                        }
                      />
                      <span>Ativar integração com {portal.name}</span>
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${portal.id}-api-key`}>Chave da API</Label>
                      <Input 
                        id={`${portal.id}-api-key`} 
                        placeholder="Chave da API fornecida pelo portal"
                        value={configData[`${portal.id}ApiKey` as keyof typeof configData] as string || ''}
                        onChange={(e) => onConfigChange({ [`${portal.id}ApiKey`]: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${portal.id}-secret`}>Segredo da API</Label>
                      <Input 
                        id={`${portal.id}-secret`} 
                        type="password"
                        placeholder="Segredo da API fornecido pelo portal"
                        value={configData[`${portal.id}Secret` as keyof typeof configData] as string || ''}
                        onChange={(e) => onConfigChange({ [`${portal.id}Secret`]: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${portal.id}-endpoint`}>URL do Endpoint</Label>
                    <Input 
                      id={`${portal.id}-endpoint`} 
                      placeholder="https://api.exemplo.com/v1"
                      value={configData[`${portal.id}Endpoint` as keyof typeof configData] as string || ''}
                      onChange={(e) => onConfigChange({ [`${portal.id}Endpoint`]: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${portal.id}-sync-interval`}>Intervalo de Sincronização</Label>
                    <Select 
                      value={configData[`${portal.id}SyncInterval` as keyof typeof configData] as string || 'daily'}
                      onValueChange={(value) => onConfigChange({ [`${portal.id}SyncInterval`]: value })}
                    >
                      <SelectTrigger id={`${portal.id}-sync-interval`}>
                        <SelectValue placeholder="Selecione um intervalo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${portal.id}-additional-notes`}>Configurações Adicionais</Label>
                    <Textarea 
                      id={`${portal.id}-additional-notes`} 
                      placeholder="Informações adicionais para configuração do portal"
                      value={configData[`${portal.id}Notes` as keyof typeof configData] as string || ''}
                      onChange={(e) => onConfigChange({ [`${portal.id}Notes`]: e.target.value })}
                      rows={4}
                    />
                  </div>
                  
                  {testStatus !== "none" && (
                    <Alert variant={testStatus === "success" ? "default" : "destructive"} className="mt-4">
                      {testStatus === "success" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {testStatus === "success" ? "Conexão estabelecida" : "Falha na conexão"}
                      </AlertTitle>
                      <AlertDescription>
                        {testStatus === "success" 
                          ? "A conexão com o portal foi estabelecida com sucesso." 
                          : "Não foi possível conectar ao portal. Verifique suas credenciais e tente novamente."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleTestConnection}
                    >
                      Testar Conexão
                    </Button>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Configurações salvas",
                          description: `Configurações para ${portal.name} foram salvas com sucesso.`,
                        });
                      }}
                    >
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Sincronização</CardTitle>
          <CardDescription>
            Defina como seus imóveis serão sincronizados com os portais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="auto-sync-enabled"
                checked={configData.autoSyncEnabled as boolean || false}
                onCheckedChange={(checked) => onConfigChange({ autoSyncEnabled: checked })}
              />
              <Label htmlFor="auto-sync-enabled">Ativar sincronização automática</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sync-direction">Direção da Sincronização</Label>
                <Select 
                  value={configData.syncDirection as string || 'both'}
                  onValueChange={(value) => onConfigChange({ syncDirection: value })}
                >
                  <SelectTrigger id="sync-direction">
                    <SelectValue placeholder="Selecione a direção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="export">Apenas exportar (do CRM para os portais)</SelectItem>
                    <SelectItem value="import">Apenas importar (dos portais para o CRM)</SelectItem>
                    <SelectItem value="both">Bidirecional (ambas as direções)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conflict-resolution">Resolução de Conflitos</Label>
                <Select 
                  value={configData.conflictResolution as string || 'crm-wins'}
                  onValueChange={(value) => onConfigChange({ conflictResolution: value })}
                >
                  <SelectTrigger id="conflict-resolution">
                    <SelectValue placeholder="Como resolver conflitos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crm-wins">CRM tem prioridade</SelectItem>
                    <SelectItem value="portal-wins">Portal tem prioridade</SelectItem>
                    <SelectItem value="newer-wins">Mais recente tem prioridade</SelectItem>
                    <SelectItem value="manual">Resolução manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sync-log">Log de Sincronização</Label>
              <Textarea 
                id="sync-log" 
                placeholder="Os logs de sincronização aparecerão aqui..."
                value="Nenhuma sincronização realizada recentemente."
                readOnly
                rows={5}
                className="font-mono text-xs"
              />
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button variant="outline">
                Sincronizar Agora
              </Button>
              <Button variant="outline">
                Limpar Logs
              </Button>
              <Button>
                Salvar Configurações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}