import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";

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
  // Cores do slider
  const featuredSliderBackgroundColor = configData.featuredSliderBackgroundColor !== undefined
    ? configData.featuredSliderBackgroundColor
    : config?.featuredSliderBackgroundColor || '#7f651e';
    
  const featuredSliderTextColor = configData.featuredSliderTextColor !== undefined
    ? configData.featuredSliderTextColor
    : config?.featuredSliderTextColor || '#ffffff';

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
                value={featuredSliderBackgroundColor}
                onChange={(e) => onConfigChange({ featuredSliderBackgroundColor: e.target.value })}
                className="h-10 w-10 border-0 rounded-l-lg p-0"
              />
              <Input 
                type="text" 
                value={featuredSliderBackgroundColor}
                onChange={(e) => onConfigChange({ featuredSliderBackgroundColor: e.target.value })}
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
                value={featuredSliderTextColor}
                onChange={(e) => onConfigChange({ featuredSliderTextColor: e.target.value })}
                className="h-10 w-10 border-0 rounded-l-lg p-0"
              />
              <Input 
                type="text" 
                value={featuredSliderTextColor}
                onChange={(e) => onConfigChange({ featuredSliderTextColor: e.target.value })}
                className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {/* Preview do Slider */}
        <div className="mt-6 p-6 rounded-lg border" 
             style={{ 
               backgroundColor: featuredSliderBackgroundColor
             }}
        >
          <h5 className="font-medium mb-3" 
              style={{ 
                color: featuredSliderTextColor
              }}
          >
            Prévia do Slider de Imóveis Destacados
          </h5>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center">
              <i className="fas fa-bed text-xl mr-2" 
                 style={{ 
                   color: featuredSliderTextColor
                 }}></i>
              <div>
                <span className="font-medium" 
                      style={{ 
                        color: featuredSliderTextColor
                      }}>3 Quartos</span>
                <span className="text-sm ml-1" 
                      style={{ 
                        color: `${featuredSliderTextColor}b3`
                      }}>Quartos</span>
              </div>
            </div>
            <div className="flex items-center">
              <i className="fas fa-shower text-xl mr-2" 
                 style={{ 
                   color: featuredSliderTextColor
                 }}></i>
              <div>
                <span className="font-medium" 
                      style={{ 
                        color: featuredSliderTextColor
                      }}>2 Banheiros</span>
                <span className="text-sm ml-1" 
                      style={{ 
                        color: `${featuredSliderTextColor}b3`
                      }}>Banhos</span>
              </div>
            </div>
            <div className="flex items-center">
              <i className="fas fa-ruler-combined text-xl mr-2" 
                 style={{ 
                   color: featuredSliderTextColor
                 }}></i>
              <div>
                <span className="font-medium" 
                      style={{ 
                        color: featuredSliderTextColor
                      }}>120</span>
                <span className="text-sm ml-1" 
                      style={{ 
                        color: `${featuredSliderTextColor}b3`
                      }}>m²</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button 
              className="inline-block px-6 py-3 rounded-lg bg-white font-medium transition-all hover:shadow-lg"
              style={{ color: featuredSliderBackgroundColor }}
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}