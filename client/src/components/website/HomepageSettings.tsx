import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";
import { Label } from "@/components/ui/label";

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
    
  // Variáveis para seção "Quem Somos"
  const showAboutSection = configData.showAboutSection !== undefined
    ? configData.showAboutSection
    : config?.showAboutSection ?? true;
    
  const aboutTitle = configData.aboutTitle !== undefined
    ? configData.aboutTitle
    : config?.aboutTitle ?? "Quem Somos";
    
  const aboutSubtitle = configData.aboutSubtitle !== undefined
    ? configData.aboutSubtitle
    : config?.aboutSubtitle ?? "Conheça Nossa História";
    
  const aboutDescription = configData.aboutDescription !== undefined
    ? configData.aboutDescription
    : config?.aboutDescription ?? "";
    
  const aboutImage = configData.aboutImage !== undefined
    ? configData.aboutImage
    : config?.aboutImage ?? "";
    
  // Variáveis para Cards de Qualidade
  const showQualityCards = configData.showQualityCards !== undefined
    ? configData.showQualityCards
    : config?.showQualityCards ?? true;
    
  // Card 1
  const qualityCard1Enabled = configData.qualityCard1Enabled !== undefined
    ? configData.qualityCard1Enabled
    : config?.qualityCard1Enabled ?? true;
    
  const qualityCard1Title = configData.qualityCard1Title !== undefined
    ? configData.qualityCard1Title
    : config?.qualityCard1Title ?? "Os melhores imóveis";
    
  const qualityCard1Text = configData.qualityCard1Text !== undefined
    ? configData.qualityCard1Text
    : config?.qualityCard1Text ?? "Escolha entre apartamentos, casas, salas, ... Considere uma visita com um dos nossos corretores";
    
  // Card 2
  const qualityCard2Enabled = configData.qualityCard2Enabled !== undefined
    ? configData.qualityCard2Enabled
    : config?.qualityCard2Enabled ?? true;
    
  const qualityCard2Title = configData.qualityCard2Title !== undefined
    ? configData.qualityCard2Title
    : config?.qualityCard2Title ?? "Vamos acompanhar você";
    
  const qualityCard2Text = configData.qualityCard2Text !== undefined
    ? configData.qualityCard2Text
    : config?.qualityCard2Text ?? "Oferecemos a você a melhor consultoria na escolha do seu imóvel, desde a escolha da localização, tipo e características";
    
  // Card 3
  const qualityCard3Enabled = configData.qualityCard3Enabled !== undefined
    ? configData.qualityCard3Enabled
    : config?.qualityCard3Enabled ?? true;
    
  const qualityCard3Title = configData.qualityCard3Title !== undefined
    ? configData.qualityCard3Title
    : config?.qualityCard3Title ?? "Sempre a melhor condição";
    
  const qualityCard3Text = configData.qualityCard3Text !== undefined
    ? configData.qualityCard3Text
    : config?.qualityCard3Text ?? "Nossa equipe irá buscar a melhor condição de fechamento, inclusive oferecendo consultoria no financiamento";

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
  
  // Manipuladores de eventos para seção "Quem Somos"
  const handleShowAboutSectionChange = (checked: boolean) => {
    onConfigChange({ showAboutSection: checked });
  };
  
  const handleAboutTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ aboutTitle: e.target.value });
  };
  
  const handleAboutSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ aboutSubtitle: e.target.value });
  };
  
  const handleAboutDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ aboutDescription: e.target.value });
  };
  
  const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Converter a imagem para base64 para armazenamento
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onConfigChange({ aboutImage: base64String });
    };
    reader.readAsDataURL(file);
  };
  
  // Manipuladores de eventos para Cards de Qualidade
  const handleShowQualityCardsChange = (checked: boolean) => {
    onConfigChange({ showQualityCards: checked });
  };
  
  // Card 1
  const handleQualityCard1EnabledChange = (checked: boolean) => {
    onConfigChange({ qualityCard1Enabled: checked });
  };
  
  const handleQualityCard1TitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ qualityCard1Title: e.target.value });
  };
  
  const handleQualityCard1TextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ qualityCard1Text: e.target.value });
  };
  
  // Card 2
  const handleQualityCard2EnabledChange = (checked: boolean) => {
    onConfigChange({ qualityCard2Enabled: checked });
  };
  
  const handleQualityCard2TitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ qualityCard2Title: e.target.value });
  };
  
  const handleQualityCard2TextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ qualityCard2Text: e.target.value });
  };
  
  // Card 3
  const handleQualityCard3EnabledChange = (checked: boolean) => {
    onConfigChange({ qualityCard3Enabled: checked });
  };
  
  const handleQualityCard3TitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ qualityCard3Title: e.target.value });
  };
  
  const handleQualityCard3TextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ qualityCard3Text: e.target.value });
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
              value={bannerTitle || ""}
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
              value={bannerSubtitle || ""}
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
          checked={showRentProperties || false} 
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
          checked={showTestimonials || false} 
          onCheckedChange={handleShowTestimonialsChange}
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      {/* Cards de Qualidade */}
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Cards de Qualidade</p>
          <p className="text-sm text-gray-500">Exibe os cards com diferenciais da imobiliária</p>
        </div>
        <Switch 
          checked={showQualityCards || false} 
          onCheckedChange={handleShowQualityCardsChange}
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      {showQualityCards && (
        <div className="space-y-6 border p-4 rounded-md bg-gray-50 mb-4">
          <h4 className="font-medium">Configurações dos Cards de Qualidade</h4>
          <p className="text-sm text-gray-500">Personalize o conteúdo dos cards que aparecem sobre o banner principal</p>
          
          {/* Card 1 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium">Card 1</h5>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ativar</span>
                <Switch 
                  checked={qualityCard1Enabled || false} 
                  onCheckedChange={handleQualityCard1EnabledChange}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>
            
            {qualityCard1Enabled && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="qualityCard1Title" className="block text-sm font-medium mb-1">
                    Título
                  </label>
                  <Input
                    id="qualityCard1Title"
                    value={qualityCard1Title || ""}
                    onChange={handleQualityCard1TitleChange}
                    placeholder="Ex: Os melhores imóveis"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="qualityCard1Text" className="block text-sm font-medium mb-1">
                    Texto
                  </label>
                  <Textarea
                    id="qualityCard1Text"
                    value={qualityCard1Text || ""}
                    onChange={handleQualityCard1TextChange}
                    placeholder="Descreva o diferencial..."
                    className="w-full resize-none"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Card 2 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium">Card 2</h5>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ativar</span>
                <Switch 
                  checked={qualityCard2Enabled || false} 
                  onCheckedChange={handleQualityCard2EnabledChange}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>
            
            {qualityCard2Enabled && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="qualityCard2Title" className="block text-sm font-medium mb-1">
                    Título
                  </label>
                  <Input
                    id="qualityCard2Title"
                    value={qualityCard2Title || ""}
                    onChange={handleQualityCard2TitleChange}
                    placeholder="Ex: Vamos acompanhar você"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="qualityCard2Text" className="block text-sm font-medium mb-1">
                    Texto
                  </label>
                  <Textarea
                    id="qualityCard2Text"
                    value={qualityCard2Text || ""}
                    onChange={handleQualityCard2TextChange}
                    placeholder="Descreva o diferencial..."
                    className="w-full resize-none"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Card 3 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium">Card 3</h5>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ativar</span>
                <Switch 
                  checked={qualityCard3Enabled || false} 
                  onCheckedChange={handleQualityCard3EnabledChange}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>
            
            {qualityCard3Enabled && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="qualityCard3Title" className="block text-sm font-medium mb-1">
                    Título
                  </label>
                  <Input
                    id="qualityCard3Title"
                    value={qualityCard3Title || ""}
                    onChange={handleQualityCard3TitleChange}
                    placeholder="Ex: Sempre a melhor condição"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="qualityCard3Text" className="block text-sm font-medium mb-1">
                    Texto
                  </label>
                  <Textarea
                    id="qualityCard3Text"
                    value={qualityCard3Text || ""}
                    onChange={handleQualityCard3TextChange}
                    placeholder="Descreva o diferencial..."
                    className="w-full resize-none"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-gray-500 italic">
              Dica: Os cards usarão a cor primária definida nas configurações gerais como cor de fundo.
            </p>
          </div>
        </div>
      )}
      
      {/* Seção Quem Somos */}
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Seção "Quem Somos"</p>
          <p className="text-sm text-gray-500">Exibe informações sobre a imobiliária</p>
        </div>
        <Switch 
          checked={showAboutSection || false} 
          onCheckedChange={handleShowAboutSectionChange}
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
      
      {showAboutSection && (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50 mb-4">
          <h4 className="font-medium">Configurações da Seção "Quem Somos"</h4>
          
          <div>
            <label htmlFor="aboutTitle" className="block text-sm font-medium mb-1">
              Título Principal
            </label>
            <Input
              id="aboutTitle"
              value={aboutTitle || ""}
              onChange={handleAboutTitleChange}
              placeholder="Ex: Quem Somos"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="aboutSubtitle" className="block text-sm font-medium mb-1">
              Subtítulo
            </label>
            <Input
              id="aboutSubtitle"
              value={aboutSubtitle || ""}
              onChange={handleAboutSubtitleChange}
              placeholder="Ex: Conheça Nossa História"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="aboutDescription" className="block text-sm font-medium mb-1">
              Descrição
            </label>
            <Textarea
              id="aboutDescription"
              value={aboutDescription || ""}
              onChange={handleAboutDescriptionChange}
              placeholder="Descreva a história e valores da imobiliária..."
              className="w-full resize-none"
              rows={5}
            />
          </div>
          
          <div>
            <label htmlFor="aboutImage" className="block text-sm font-medium mb-1">
              Imagem da Seção
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  id="aboutImage"
                  type="file"
                  accept="image/*"
                  onChange={handleAboutImageChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tamanho recomendado: 600x400 pixels. Formatos: JPG, PNG
                </p>
              </div>
              
              {aboutImage && (
                <div className="w-24 h-24 border rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={aboutImage} 
                    alt="Pré-visualização" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
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
