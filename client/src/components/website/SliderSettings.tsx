import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";
import { useState, useEffect } from "react";

interface SliderSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function SliderSettings({ 
  config, 
  configData, 
  onConfigChange 
}: SliderSettingsProps) {
  // Estado local para as cores do slider
  const [localBackgroundColor, setLocalBackgroundColor] = useState(
    configData.featuredSliderBackgroundColor || config?.featuredSliderBackgroundColor || '#7f651e'
  );
  
  const [localTextColor, setLocalTextColor] = useState(
    configData.featuredSliderTextColor || config?.featuredSliderTextColor || '#ffffff'
  );
  
  const [localButtonTextColor, setLocalButtonTextColor] = useState(
    configData.featuredSliderButtonTextColor || config?.featuredSliderButtonTextColor || config?.primaryColor || '#7f651e'
  );
  
  // Atualiza os estados locais quando as props mudam
  useEffect(() => {
    setLocalBackgroundColor(configData.featuredSliderBackgroundColor || config?.featuredSliderBackgroundColor || '#7f651e');
    setLocalTextColor(configData.featuredSliderTextColor || config?.featuredSliderTextColor || '#ffffff');
    setLocalButtonTextColor(configData.featuredSliderButtonTextColor || config?.featuredSliderButtonTextColor || config?.primaryColor || '#7f651e');
  }, [config, configData]);
  
  // Função para atualizar cor de fundo
  const updateBackgroundColor = (color: string) => {
    console.log("Atualizando cor de fundo para:", color);
    setLocalBackgroundColor(color);
    onConfigChange({ 
      ...configData,
      featuredSliderBackgroundColor: color 
    });
  };
  
  // Função para atualizar cor do texto
  const updateTextColor = (color: string) => {
    console.log("Atualizando cor de texto para:", color);
    setLocalTextColor(color);
    onConfigChange({ 
      ...configData,
      featuredSliderTextColor: color 
    });
  };
  
  // Função para atualizar cor do texto do botão
  const updateButtonTextColor = (color: string) => {
    console.log("Atualizando cor do texto do botão para:", color);
    setLocalButtonTextColor(color);
    onConfigChange({ 
      ...configData,
      featuredSliderButtonTextColor: color 
    });
  };
  
  // Log para depuração
  console.log("SliderSettings - Valores atuais:", {
    configData,
    localBackgroundColor,
    localTextColor,
    localButtonTextColor
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Configurações do Slider de Imóveis Destacados</h3>
        <p className="text-sm text-gray-600 mb-4">
          Personalize a aparência do slider de imóveis destacados na página inicial
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Cor de Fundo do Slider
            </Label>
            <div className="flex">
              <Input 
                type="color" 
                value={localBackgroundColor}
                onChange={(e) => updateBackgroundColor(e.target.value)}
                className="h-10 w-10 border-0 rounded-l-lg p-0"
              />
              <Input 
                type="text" 
                value={localBackgroundColor}
                onChange={(e) => updateBackgroundColor(e.target.value)}
                className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Cor do Texto do Slider
            </Label>
            <div className="flex">
              <Input 
                type="color" 
                value={localTextColor}
                onChange={(e) => updateTextColor(e.target.value)}
                className="h-10 w-10 border-0 rounded-l-lg p-0"
              />
              <Input 
                type="text" 
                value={localTextColor}
                onChange={(e) => updateTextColor(e.target.value)}
                className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Cor do Texto do Botão
            </Label>
            <div className="flex">
              <Input 
                type="color" 
                value={localButtonTextColor}
                onChange={(e) => updateButtonTextColor(e.target.value)}
                className="h-10 w-10 border-0 rounded-l-lg p-0"
              />
              <Input 
                type="text" 
                value={localButtonTextColor}
                onChange={(e) => updateButtonTextColor(e.target.value)}
                className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {/* Preview do Slider */}
        <div className="mt-6 p-6 rounded-lg border" 
             style={{ 
               backgroundColor: localBackgroundColor
             }}
        >
          <h5 className="font-medium mb-3" 
              style={{ 
                color: localTextColor
              }}
          >
            Prévia do Slider de Imóveis Destacados
          </h5>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center">
              <i className="fas fa-bed text-xl mr-2" 
                 style={{ 
                   color: localTextColor
                 }}></i>
              <div>
                <span className="font-medium" 
                      style={{ 
                        color: localTextColor
                      }}>3 Quartos</span>
                <span className="text-sm ml-1" 
                      style={{ 
                        color: `${localTextColor}b3`
                      }}>Quartos</span>
              </div>
            </div>
            <div className="flex items-center">
              <i className="fas fa-shower text-xl mr-2" 
                 style={{ 
                   color: localTextColor
                 }}></i>
              <div>
                <span className="font-medium" 
                      style={{ 
                        color: localTextColor
                      }}>2 Banheiros</span>
                <span className="text-sm ml-1" 
                      style={{ 
                        color: `${localTextColor}b3`
                      }}>Banhos</span>
              </div>
            </div>
            <div className="flex items-center">
              <i className="fas fa-ruler-combined text-xl mr-2" 
                 style={{ 
                   color: localTextColor
                 }}></i>
              <div>
                <span className="font-medium" 
                      style={{ 
                        color: localTextColor
                      }}>120</span>
                <span className="text-sm ml-1" 
                      style={{ 
                        color: `${localTextColor}b3`
                      }}>m²</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button 
              className="inline-block px-6 py-3 rounded-lg bg-white font-medium transition-all hover:shadow-lg"
              style={{ color: localButtonTextColor }}
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}