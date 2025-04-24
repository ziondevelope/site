import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PanelRight, PanelLeft, MessageSquare, Phone } from "lucide-react";

interface ChatSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function ChatSettings({ 
  config, 
  configData, 
  onConfigChange 
}: ChatSettingsProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [botaoAtivo, setBotaoAtivo] = useState<boolean>(false);

  // Quando o componente montar ou as props mudarem
  useEffect(() => {
    if (config) {
      setPhoneNumber(config.whatsappNumber || "");
      setBotaoAtivo(config.whatsappChatEnabled || false);
    }
  }, [config]);

  // Formatação do número de telefone
  const formatPhone = (value: string) => {
    // Remove qualquer caractere não numérico
    let cleaned = value.replace(/\D/g, '');
    
    // Limita o tamanho máximo (11 dígitos para celular com DDD no Brasil)
    cleaned = cleaned.slice(0, 11);
    
    // Adiciona a formatação: (XX) X XXXX-XXXX
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    } else if (cleaned.length > 0) {
      formatted = `(${cleaned}`;
    }
    
    return formatted;
  };

  // Handler para mudança no número de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setPhoneNumber(formattedPhone);
    
    // Extrai apenas os números para salvar
    const numbersOnly = formattedPhone.replace(/\D/g, '');
    onConfigChange({ whatsappNumber: numbersOnly });
  };

  // Handler para mudança no checkbox de ativação
  const handleEnabledChange = (checked: boolean) => {
    setBotaoAtivo(checked);
    onConfigChange({ whatsappChatEnabled: checked });
  };

  // Handler para mudanças nos campos de texto
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    field: keyof UpdateWebsiteConfig
  ) => {
    console.log(`Mudando campo ${field} para o valor ${e.target.value}`);
    onConfigChange({ [field]: e.target.value });
  };

  // Handler para mudança na posição do botão
  const handlePositionChange = (value: string) => {
    onConfigChange({ whatsappButtonPosition: value });
  };

  // Handler para mudança no checkbox de formulário
  const handleFormEnabledChange = (checked: boolean) => {
    onConfigChange({ whatsappFormEnabled: checked });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna 1 - Configurações Principais */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Configurações do Chat</CardTitle>
              <CardDescription>
                Configure o botão de WhatsApp que aparecerá no site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="whatsappActive" 
                  checked={configData.whatsappChatEnabled ?? botaoAtivo}
                  onCheckedChange={handleEnabledChange}
                />
                <Label htmlFor="whatsappActive" className="cursor-pointer">
                  Ativar botão de WhatsApp
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <Input
                    id="whatsappNumber"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="(00) 0 0000-0000"
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Digite o número no formato: (DD) D DDDD-DDDD
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsappMessage">Mensagem padrão</Label>
                <Textarea
                  id="whatsappMessage"
                  value={configData.whatsappMessage ?? config?.whatsappMessage ?? "Olá! Gostaria de mais informações sobre um imóvel."}
                  onChange={(e) => handleTextChange(e, "whatsappMessage")}
                  placeholder="Olá! Gostaria de mais informações sobre um imóvel."
                  className="resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Esta mensagem será enviada automaticamente quando o visitante clicar no botão
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna 2 - Aparência do Botão */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Aparência do Botão</CardTitle>
              <CardDescription>
                Personalize como o botão será exibido no site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buttonText">Texto do botão</Label>
                <Input
                  id="buttonText"
                  value={configData.whatsappButtonText ?? config?.whatsappButtonText ?? "Falar com corretor"}
                  onChange={(e) => handleTextChange(e, "whatsappButtonText")}
                  placeholder="Falar com corretor"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initialMessage">Mensagem inicial da caixa de chat</Label>
                <Textarea
                  id="initialMessage"
                  value={configData.whatsappInitialMessage ?? config?.whatsappInitialMessage ?? "Está com dificuldades para achar o imóvel dos seus sonhos? De Imóveis Populares a de Alto Padrão, CHAME O CAPITÃO!!"}
                  onChange={(e) => handleTextChange(e, "whatsappInitialMessage")}
                  placeholder="Está com dificuldades para achar o imóvel dos seus sonhos? De Imóveis Populares a de Alto Padrão, CHAME O CAPITÃO!!"
                  className="resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Esta mensagem aparecerá na caixa de diálogo que surge ao lado do botão de WhatsApp
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="chatBackgroundColor">Cor de fundo da caixa</Label>
                  <div className="flex">
                    <input
                      type="color"
                      id="chatBackgroundColor"
                      value={configData.whatsappChatBackgroundColor ?? config?.whatsappChatBackgroundColor ?? "#ffffff"}
                      onChange={(e) => {
                        console.log("Color picker alterado para:", e.target.value);
                        const color = e.target.value;
                        // Importante: atualização direta com valor do color picker
                        onConfigChange({ whatsappChatBackgroundColor: color });
                      }}
                      className="w-10 h-10 rounded-l-md cursor-pointer border border-r-0 border-gray-300"
                    />
                    <Input
                      value={configData.whatsappChatBackgroundColor ?? config?.whatsappChatBackgroundColor ?? "#ffffff"}
                      onChange={(e) => {
                        console.log("Input text alterado para:", e.target.value);
                        const color = e.target.value;
                        // Importante: atualização direta com valor do input
                        onConfigChange({ whatsappChatBackgroundColor: color });
                      }}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chatTextColor">Cor do texto</Label>
                  <div className="flex">
                    <input
                      type="color"
                      id="chatTextColor"
                      value={configData.whatsappChatTextColor ?? config?.whatsappChatTextColor ?? "#333333"}
                      onChange={(e) => {
                        console.log("Color picker text alterado para:", e.target.value);
                        const color = e.target.value;
                        // Importante: atualização direta com valor do color picker
                        onConfigChange({ whatsappChatTextColor: color });
                      }}
                      className="w-10 h-10 rounded-l-md cursor-pointer border border-r-0 border-gray-300"
                    />
                    <Input
                      value={configData.whatsappChatTextColor ?? config?.whatsappChatTextColor ?? "#333333"}
                      onChange={(e) => {
                        console.log("Input text color alterado para:", e.target.value);
                        const color = e.target.value;
                        // Importante: atualização direta com valor do input
                        onConfigChange({ whatsappChatTextColor: color });
                      }}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-md border" style={{
                backgroundColor: configData.whatsappChatBackgroundColor ?? config?.whatsappChatBackgroundColor ?? "#ffffff",
                color: configData.whatsappChatTextColor ?? config?.whatsappChatTextColor ?? "#333333",
              }}>
                <p className="text-sm" style={{ color: configData.whatsappChatTextColor ?? config?.whatsappChatTextColor ?? "#333333" }}>
                  {configData.whatsappInitialMessage ?? config?.whatsappInitialMessage ?? "Está com dificuldades para achar o imóvel dos seus sonhos? De Imóveis Populares a de Alto Padrão, CHAME O CAPITÃO!!"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Posição do botão</Label>
                <RadioGroup 
                  defaultValue={configData.whatsappButtonPosition ?? config?.whatsappButtonPosition ?? "right"} 
                  onValueChange={handlePositionChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="right" />
                    <Label htmlFor="right" className="flex items-center">
                      <PanelRight className="h-4 w-4 mr-1" />
                      Direita
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="left" />
                    <Label htmlFor="left" className="flex items-center">
                      <PanelLeft className="h-4 w-4 mr-1" />
                      Esquerda
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="mt-4 flex items-center justify-center">
                <div className={`bg-[#25D366] text-white px-4 py-2 rounded-full flex items-center shadow-md`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>{configData.whatsappButtonText || "Falar com corretor"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna 3 - Formulário */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Formulário de Captura</CardTitle>
              <CardDescription>
                Colete informações antes de redirecionar para o WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="formActive" 
                  checked={configData.whatsappFormEnabled ?? config?.whatsappFormEnabled ?? true}
                  onCheckedChange={handleFormEnabledChange}
                />
                <Label htmlFor="formActive" className="cursor-pointer">
                  Mostrar formulário antes de redirecionar
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="formTitle">Título do formulário</Label>
                <Input
                  id="formTitle"
                  value={configData.whatsappFormTitle ?? config?.whatsappFormTitle ?? "Entre em contato com um corretor"}
                  onChange={(e) => handleTextChange(e, "whatsappFormTitle")}
                  placeholder="Entre em contato com um corretor"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="formMessage">Mensagem do formulário</Label>
                <Textarea
                  id="formMessage"
                  value={configData.whatsappFormMessage ?? config?.whatsappFormMessage ?? "Preencha seus dados para que um de nossos corretores possa lhe atender da melhor forma."}
                  onChange={(e) => handleTextChange(e, "whatsappFormMessage")}
                  placeholder="Preencha seus dados para que um de nossos corretores possa lhe atender da melhor forma."
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md mt-2">
                <p>Quando ativado, o formulário coletará o nome e telefone do visitante para criar um lead no sistema antes de redirecionar para o WhatsApp.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}