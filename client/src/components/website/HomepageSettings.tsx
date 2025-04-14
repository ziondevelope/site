import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";

interface HomepageSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function HomepageSettings({ config, configData, onConfigChange }: HomepageSettingsProps) {
  // These are derived values that reflect either the current editing state (configData)
  // or fallback to the saved values (config) if no edits have been made
  const showSearchBar = configData.showSearchBar !== undefined 
    ? configData.showSearchBar 
    : config?.showSearchBar ?? true;
    
  const showFeaturedProperties = configData.showFeaturedProperties !== undefined 
    ? configData.showFeaturedProperties 
    : config?.showFeaturedProperties ?? true;
    
  const showSaleProperties = configData.showSaleProperties !== undefined 
    ? configData.showSaleProperties 
    : config?.showSaleProperties ?? true;
    
  const showRentProperties = configData.showRentProperties !== undefined 
    ? configData.showRentProperties 
    : config?.showRentProperties ?? true;
    
  const showTestimonials = configData.showTestimonials !== undefined 
    ? configData.showTestimonials 
    : config?.showTestimonials ?? true;
    
  const showBannerText = configData.showBannerText !== undefined 
    ? configData.showBannerText 
    : config?.showBannerText ?? true;
    
  const bannerTitle = configData.bannerTitle !== undefined 
    ? configData.bannerTitle 
    : config?.bannerTitle ?? "Encontre o imóvel dos seus sonhos";
    
  const bannerSubtitle = configData.bannerSubtitle !== undefined 
    ? configData.bannerSubtitle 
    : config?.bannerSubtitle ?? "Oferecemos as melhores opções de imóveis para compra e aluguel com atendimento personalizado";

  // Handle change functions
  const handleShowSearchBarChange = (checked: boolean) => {
    onConfigChange({ showSearchBar: checked });
  };

  const handleShowFeaturedPropertiesChange = (checked: boolean) => {
    onConfigChange({ showFeaturedProperties: checked });
  };

  const handleShowSalePropertiesChange = (checked: boolean) => {
    onConfigChange({ showSaleProperties: checked });
  };

  const handleShowRentPropertiesChange = (checked: boolean) => {
    onConfigChange({ showRentProperties: checked });
  };

  const handleShowTestimonialsChange = (checked: boolean) => {
    onConfigChange({ showTestimonials: checked });
  };
  
  const handleShowBannerTextChange = (checked: boolean) => {
    onConfigChange({ showBannerText: checked });
  };
  
  const handleBannerTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ bannerTitle: e.target.value });
  };
  
  const handleBannerSubtitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ bannerSubtitle: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg border-b pb-2">Texto do Banner</h3>
      
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="font-medium">Exibir Texto no Banner</p>
          <p className="text-sm text-gray-500">Ativa ou desativa o título e subtítulo no banner principal</p>
        </div>
        <Switch 
          checked={showBannerText || false} 
          onCheckedChange={handleShowBannerTextChange} 
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      {showBannerText && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50 mb-4">
          <div>
            <label htmlFor="bannerTitle" className="block text-sm font-medium mb-1">
              Título do Banner
            </label>
            <Input
              id="bannerTitle"
              value={bannerTitle}
              onChange={handleBannerTitleChange}
              placeholder="Digite o título principal"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="bannerSubtitle" className="block text-sm font-medium mb-1">
              Subtítulo do Banner
            </label>
            <Textarea
              id="bannerSubtitle"
              value={bannerSubtitle}
              onChange={handleBannerSubtitleChange}
              placeholder="Digite o texto secundário"
              className="w-full resize-none"
              rows={3}
            />
          </div>
        </div>
      )}
      
      <h3 className="font-medium text-lg border-b pb-2 mt-6">Componentes da Página Inicial</h3>
      
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="font-medium">Barra de Pesquisa</p>
          <p className="text-sm text-gray-500">Exibe a barra de pesquisa de imóveis no topo do site</p>
        </div>
        <Switch 
          checked={showSearchBar || false} 
          onCheckedChange={handleShowSearchBarChange} 
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Imóveis em Destaque</p>
          <p className="text-sm text-gray-500">Exibe carrossel de imóveis em destaque</p>
        </div>
        <Switch 
          checked={showFeaturedProperties || false} 
          onCheckedChange={handleShowFeaturedPropertiesChange} 
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Imóveis para Venda</p>
          <p className="text-sm text-gray-500">Exibe seção de imóveis para venda</p>
        </div>
        <Switch 
          checked={showSaleProperties || false} 
          onCheckedChange={handleShowSalePropertiesChange} 
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Imóveis para Alugar</p>
          <p className="text-sm text-gray-500">Exibe seção de imóveis para locação</p>
        </div>
        <Switch 
          checked={showRentProperties} 
          onCheckedChange={handleShowRentPropertiesChange} 
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Depoimentos</p>
          <p className="text-sm text-gray-500">Exibe depoimentos de clientes</p>
        </div>
        <Switch 
          checked={showTestimonials} 
          onCheckedChange={handleShowTestimonialsChange}
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      <div className="pt-4">
        <Button 
          className="rounded-full px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          variant="outline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Visualizar Prévia
        </Button>
      </div>
    </div>
  );
}
