import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface SystemSettingsProps {
  config?: WebsiteConfig;
  isLoading: boolean;
}

export default function SystemSettings({ config, isLoading }: SystemSettingsProps) {
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
        description: "As configurações do sistema foram atualizadas com sucesso",
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

  // Handle save
  const handleSave = () => {
    if (Object.keys(configData).length === 0) {
      toast({
        title: "Nenhuma alteração",
        description: "Não há alterações para salvar",
      });
      return;
    }
    updateMutation.mutate(configData);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configuração do Sistema</h3>
        <p className="text-sm text-gray-500">
          Configure os parâmetros gerais do sistema e da sua imobiliária
        </p>
      </div>

      <Separator />

      {/* API e Integração */}
      <div className="space-y-4">
        <h4 className="font-medium text-md">API e Integração</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-api">WhatsApp API URL</Label>
            <Input 
              id="whatsapp-api" 
              placeholder="https://api.whatsapp.com" 
              value={getValue('whatsappApiUrl') || ''} 
              onChange={(e) => handleConfigChange({ whatsappApiUrl: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              URL base para integração com WhatsApp
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maps-api-key">Google Maps API Key</Label>
            <Input 
              id="maps-api-key" 
              placeholder="AIzaSyB..." 
              value={getValue('mapsApiKey') || ''} 
              onChange={(e) => handleConfigChange({ mapsApiKey: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Chave da API do Google Maps para exibir mapas
            </p>
          </div>
        </div>
      </div>

      {/* Configurações Gerais */}
      <div className="space-y-4">
        <h4 className="font-medium text-md">Configurações Gerais</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Imobiliária</Label>
            <Input 
              id="company-name" 
              placeholder="Sua Imobiliária" 
              value={getValue('companyName') || ''} 
              onChange={(e) => handleConfigChange({ companyName: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email do Administrador</Label>
            <Input 
              id="admin-email" 
              type="email"
              placeholder="admin@suaimobiliaria.com" 
              value={getValue('adminEmail') || ''} 
              onChange={(e) => handleConfigChange({ adminEmail: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email de Contato</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="contato@suaimobiliaria.com" 
              value={getValue('email') || ''} 
              onChange={(e) => handleConfigChange({ email: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              placeholder="(11) 99999-9999" 
              value={getValue('phone') || ''} 
              onChange={(e) => handleConfigChange({ phone: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Funcionalidades */}
      <div className="space-y-4">
        <h4 className="font-medium text-md">Funcionalidades</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h5 className="font-medium">Notificações por Email</h5>
              <p className="text-sm text-gray-500">Enviar notificações por email quando novos leads forem cadastrados</p>
            </div>
            <Switch 
              checked={getValue('enableEmailNotifications') === true}
              onCheckedChange={(checked) => handleConfigChange({ enableEmailNotifications: checked })}
            />
          </Card>
          
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h5 className="font-medium">Integração com WhatsApp</h5>
              <p className="text-sm text-gray-500">Permitir comunicação com clientes via WhatsApp</p>
            </div>
            <Switch 
              checked={getValue('enableWhatsApp') === true}
              onCheckedChange={(checked) => handleConfigChange({ enableWhatsApp: checked })}
            />
          </Card>
        </div>
      </div>

      {/* Aparência da Página de Detalhes do Imóvel */}
      <div className="space-y-4">
        <h4 className="font-medium text-md">Aparência da Página de Detalhes do Imóvel</h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property-details-background">Cor de Fundo</Label>
            <div className="flex">
              <Input 
                id="property-details-background" 
                type="color"
                className="w-12 h-10 p-1 mr-2"
                value={getValue('propertyDetailsBackgroundColor') || '#ffffff'} 
                onChange={(e) => handleConfigChange({ propertyDetailsBackgroundColor: e.target.value })}
              />
              <Input 
                type="text"
                className="flex-1"
                value={getValue('propertyDetailsBackgroundColor') || '#ffffff'} 
                onChange={(e) => handleConfigChange({ propertyDetailsBackgroundColor: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500">
              Cor de fundo para a página de detalhes do imóvel
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="property-details-text">Cor do Texto</Label>
            <div className="flex">
              <Input 
                id="property-details-text" 
                type="color"
                className="w-12 h-10 p-1 mr-2"
                value={getValue('propertyDetailsTextColor') || '#333333'} 
                onChange={(e) => handleConfigChange({ propertyDetailsTextColor: e.target.value })}
              />
              <Input 
                type="text"
                className="flex-1"
                value={getValue('propertyDetailsTextColor') || '#333333'} 
                onChange={(e) => handleConfigChange({ propertyDetailsTextColor: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500">
              Cor do texto na página de detalhes do imóvel
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="property-details-icons">Cor dos Ícones</Label>
            <div className="flex">
              <Input 
                id="property-details-icons" 
                type="color"
                className="w-12 h-10 p-1 mr-2"
                value={getValue('propertyDetailsIconsColor') || config?.primaryColor || '#3B82F6'} 
                onChange={(e) => handleConfigChange({ propertyDetailsIconsColor: e.target.value })}
              />
              <Input 
                type="text"
                className="flex-1"
                value={getValue('propertyDetailsIconsColor') || config?.primaryColor || '#3B82F6'} 
                onChange={(e) => handleConfigChange({ propertyDetailsIconsColor: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500">
              Cor dos ícones e elementos visuais na página de detalhes
            </p>
          </div>
        </div>
        
        {/* Preview */}
        <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: getValue('propertyDetailsBackgroundColor') || '#ffffff' }}>
          <h5 className="font-medium mb-2" style={{ color: getValue('propertyDetailsTextColor') || '#333333' }}>
            Prévia da Página de Detalhes
          </h5>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <i className="fas fa-bed mr-2" style={{ color: getValue('propertyDetailsIconsColor') || config?.primaryColor || '#3B82F6' }}></i>
              <span style={{ color: getValue('propertyDetailsTextColor') || '#333333' }}>3 Quartos</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-shower mr-2" style={{ color: getValue('propertyDetailsIconsColor') || config?.primaryColor || '#3B82F6' }}></i>
              <span style={{ color: getValue('propertyDetailsTextColor') || '#333333' }}>2 Banheiros</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-ruler-combined mr-2" style={{ color: getValue('propertyDetailsIconsColor') || config?.primaryColor || '#3B82F6' }}></i>
              <span style={{ color: getValue('propertyDetailsTextColor') || '#333333' }}>120 m²</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={() => setConfigData({})}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending || Object.keys(configData).length === 0}>
          {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}