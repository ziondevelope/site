import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface WhatsAppSettingsProps {
  config?: WebsiteConfig;
  isLoading: boolean;
}

export default function WhatsAppSettings({ config, isLoading }: WhatsAppSettingsProps) {
  const [configData, setConfigData] = useState<Partial<UpdateWebsiteConfig>>({});
  const { toast } = useToast();

  // Save configuration mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UpdateWebsiteConfig>) => {
      return apiRequest('/api/website/config', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/website/config'] });
      toast({
        title: "Configurações salvas",
        description: "As configurações do WhatsApp foram atualizadas com sucesso",
      });
      // Reset local changes
      setConfigData({});
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    },
  });

  // Handle changes to configuration
  const handleConfigChange = (data: Partial<UpdateWebsiteConfig>) => {
    setConfigData(prev => ({ ...prev, ...data }));
  };

  // Get effective values (either edited value or original from config)
  const getValue = <K extends keyof UpdateWebsiteConfig>(
    key: K
  ): UpdateWebsiteConfig[K] | null => {
    if (key in configData) {
      return configData[key] || null;
    }
    return config?.[key] || null;
  };

  // Handle save button
  const handleSave = () => {
    if (Object.keys(configData).length > 0) {
      updateMutation.mutate(configData);
    }
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-full h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Configurações do WhatsApp</h3>
        <p className="text-sm text-gray-500 mt-1">
          Configure as opções de WhatsApp para o site público
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="whatsappChatEnabled" className="font-medium">
              Ativar Chat WhatsApp
            </Label>
            <Switch
              id="whatsappChatEnabled"
              checked={!!getValue("whatsappChatEnabled")}
              onCheckedChange={(checked) =>
                handleConfigChange({ whatsappChatEnabled: checked })
              }
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mostrar botão de WhatsApp no site público
          </p>

          <div className="mt-6">
            <Label htmlFor="whatsappNumber" className="font-medium">
              Número do WhatsApp
            </Label>
            <Input
              id="whatsappNumber"
              placeholder="Ex: 5521987654321"
              value={getValue("whatsappNumber") || ""}
              onChange={(e) =>
                handleConfigChange({ whatsappNumber: e.target.value })
              }
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Informe o número com código do país (Ex: 55 para Brasil) e DDD
            </p>
          </div>

          <div className="mt-6">
            <Label htmlFor="whatsappMessage" className="font-medium">
              Mensagem Padrão
            </Label>
            <Textarea
              id="whatsappMessage"
              placeholder="Olá! Gostaria de mais informações sobre um imóvel."
              value={getValue("whatsappMessage") || ""}
              onChange={(e) =>
                handleConfigChange({ whatsappMessage: e.target.value })
              }
              className="mt-1"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mensagem que será pré-preenchida quando o usuário clicar no botão de WhatsApp
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="whatsappFormEnabled" className="font-medium">
              Exibir Formulário Antes do Contato
            </Label>
            <Switch
              id="whatsappFormEnabled"
              checked={!!getValue("whatsappFormEnabled")}
              onCheckedChange={(checked) =>
                handleConfigChange({ whatsappFormEnabled: checked })
              }
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mostrar formulário para captura de contato antes de redirecionar para WhatsApp
          </p>

          <div className="mt-6">
            <Label htmlFor="whatsappFormTitle" className="font-medium">
              Título do Formulário
            </Label>
            <Input
              id="whatsappFormTitle"
              placeholder="Entre em contato com um corretor"
              value={getValue("whatsappFormTitle") || ""}
              onChange={(e) =>
                handleConfigChange({ whatsappFormTitle: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div className="mt-6">
            <Label htmlFor="whatsappFormMessage" className="font-medium">
              Mensagem do Formulário
            </Label>
            <Textarea
              id="whatsappFormMessage"
              placeholder="Preencha seus dados para que um de nossos corretores possa lhe atender da melhor forma."
              value={getValue("whatsappFormMessage") || ""}
              onChange={(e) =>
                handleConfigChange({ whatsappFormMessage: e.target.value })
              }
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div className="mt-6">
            <Label htmlFor="whatsappInitialMessage" className="font-medium">
              Mensagem Inicial da Caixa de Diálogo
            </Label>
            <Textarea
              id="whatsappInitialMessage"
              placeholder="Está com dificuldades para achar o imóvel dos seus sonhos? De Imóveis Populares a de Alto Padrão, CHAME O CAPITÃO!!"
              value={getValue("whatsappInitialMessage") || ""}
              onChange={(e) =>
                handleConfigChange({ whatsappInitialMessage: e.target.value })
              }
              className="mt-1"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mensagem que aparece na caixa de diálogo que surge quando o usuário entra no site
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending || Object.keys(configData).length === 0}
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}