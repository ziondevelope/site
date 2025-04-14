import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";

interface InformationSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function InformationSettings({ config, configData, onConfigChange }: InformationSettingsProps) {
  // Valores derivados que refletem o estado atual de edição (configData)
  // ou usam os valores salvos (config) se nenhuma edição foi feita
  const address = configData.address !== undefined 
    ? configData.address 
    : config?.address || '';
    
  const email = configData.email !== undefined 
    ? configData.email 
    : config?.email || '';
    
  const phone = configData.phone !== undefined 
    ? configData.phone 
    : config?.phone || '';
  
  const workingHours = configData.workingHours !== undefined 
    ? configData.workingHours 
    : config?.workingHours || '';

  // Funções de manipulação de mudanças
  const handleAddressChange = (newValue: string) => {
    onConfigChange({ address: newValue });
  };

  const handleEmailChange = (newValue: string) => {
    onConfigChange({ email: newValue });
  };

  const handlePhoneChange = (newValue: string) => {
    onConfigChange({ phone: newValue });
  };

  const handleWorkingHoursChange = (newValue: string) => {
    onConfigChange({ workingHours: newValue });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-medium mb-4">Informações de Contato</h3>
        <p className="text-gray-500 mb-6">
          Configure as informações de contato da imobiliária que serão exibidas no site público.
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Endereço completo</Label>
            <Textarea
              id="address"
              placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <p className="text-sm text-gray-500">Endereço completo da imobiliária.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail de contato</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@imobiliaria.com.br"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            <p className="text-sm text-gray-500">E-mail principal para contato.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone de contato</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 3333-4444"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
            <p className="text-sm text-gray-500">Número de telefone principal para contato.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workingHours">Horário de funcionamento</Label>
            <Textarea
              id="workingHours"
              placeholder="Segunda a Sexta: 9h às 18h&#10;Sábados: 9h às 13h"
              value={workingHours}
              onChange={(e) => handleWorkingHoursChange(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <p className="text-sm text-gray-500">Horário de funcionamento da imobiliária.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}