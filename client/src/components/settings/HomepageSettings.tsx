import React from 'react';
import { WebsiteConfig, UpdateWebsiteConfig } from '@shared/schema';
import HomeSectionsOrderSettings from './HomeSectionsOrderSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface HomepageSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function HomepageSettings({ config, configData, onConfigChange }: HomepageSettingsProps) {
  // Seção Banner
  const bannerTitle = configData.bannerTitle !== undefined
    ? configData.bannerTitle
    : config?.bannerTitle || "Encontre o imóvel dos seus sonhos";
    
  const bannerSubtitle = configData.bannerSubtitle !== undefined
    ? configData.bannerSubtitle
    : config?.bannerSubtitle || "Oferecemos as melhores opções de imóveis para compra e aluguel com atendimento personalizado";
  
  const showBannerText = configData.showBannerText !== undefined
    ? !!configData.showBannerText
    : config?.showBannerText !== false;
    
  const showSearchBar = configData.showSearchBar !== undefined
    ? !!configData.showSearchBar
    : config?.showSearchBar !== false;

  // Manipuladores de eventos
  const handleBannerTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ bannerTitle: e.target.value });
  };
  
  const handleBannerSubtitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ bannerSubtitle: e.target.value });
  };
  
  const handleShowBannerTextChange = (checked: boolean) => {
    onConfigChange({ showBannerText: checked });
  };
  
  const handleShowSearchBarChange = (checked: boolean) => {
    onConfigChange({ showSearchBar: checked });
  };

  // Manipuladores para a seção "Quem Somos"
  const aboutTitle = configData.aboutTitle !== undefined
    ? configData.aboutTitle || ""
    : config?.aboutTitle || "Quem Somos";
    
  const aboutSubtitle = configData.aboutSubtitle !== undefined
    ? configData.aboutSubtitle || ""
    : config?.aboutSubtitle || "Conheça Nossa História";
    
  const aboutDescription = configData.aboutDescription !== undefined
    ? configData.aboutDescription || ""
    : config?.aboutDescription || "";
    
  const showAboutSection = configData.showAboutSection !== undefined
    ? !!configData.showAboutSection
    : config?.showAboutSection !== false;
  
  const handleAboutTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ aboutTitle: e.target.value });
  };
  
  const handleAboutSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ aboutSubtitle: e.target.value });
  };
  
  const handleAboutDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ aboutDescription: e.target.value });
  };
  
  const handleShowAboutSectionChange = (checked: boolean) => {
    onConfigChange({ showAboutSection: checked });
  };

  return (
    <Tabs defaultValue="sections" className="w-full">
      <TabsList className="grid grid-cols-3 max-w-md mb-6">
        <TabsTrigger value="sections">Seções</TabsTrigger>
        <TabsTrigger value="banner">Banner</TabsTrigger>
        <TabsTrigger value="aboutUs">Quem Somos</TabsTrigger>
      </TabsList>
      
      {/* Aba de Seções e Ordem */}
      <TabsContent value="sections" className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <HomeSectionsOrderSettings 
              config={config}
              configData={configData}
              onConfigChange={onConfigChange}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Aba de Banner */}
      <TabsContent value="banner" className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="banner-text-switch" className="text-base font-medium">
                  Exibir texto no banner
                </Label>
                <Switch 
                  id="banner-text-switch" 
                  checked={showBannerText}
                  onCheckedChange={handleShowBannerTextChange}
                />
              </div>
              <p className="text-sm text-gray-500">
                Exibe o título e subtítulo no banner principal do site
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="search-bar-switch" className="text-base font-medium">
                  Exibir barra de busca
                </Label>
                <Switch 
                  id="search-bar-switch" 
                  checked={showSearchBar}
                  onCheckedChange={handleShowSearchBarChange}
                />
              </div>
              <p className="text-sm text-gray-500">
                Exibe o formulário de busca de imóveis no banner
              </p>
            </div>
            
            <div className="pt-4 space-y-3">
              <div>
                <Label htmlFor="banner-title" className="text-sm font-medium">
                  Título do Banner
                </Label>
                <Input 
                  id="banner-title" 
                  value={bannerTitle}
                  onChange={handleBannerTitleChange}
                  placeholder="Encontre o imóvel dos seus sonhos"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="banner-subtitle" className="text-sm font-medium">
                  Subtítulo do Banner
                </Label>
                <Textarea 
                  id="banner-subtitle" 
                  value={bannerSubtitle}
                  onChange={handleBannerSubtitleChange}
                  placeholder="Oferecemos as melhores opções de imóveis para compra e aluguel com atendimento personalizado"
                  className="mt-1 min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="banner-background" className="text-sm font-medium">
                  Imagem de Fundo do Banner
                </Label>
                <div className="mt-1">
                  {config?.bannerBackground ? (
                    <div className="relative">
                      <img 
                        src={config.bannerBackground} 
                        alt="Banner background" 
                        className="w-full h-48 object-cover rounded-md"
                      />
                      {/* Componente de upload seria implementado aqui */}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center">
                      <div className="text-center">
                        <svg 
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          Faça upload de uma imagem para o fundo do banner
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Aba Quem Somos */}
      <TabsContent value="aboutUs" className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="about-section-switch" className="text-base font-medium">
                  Exibir seção Quem Somos
                </Label>
                <Switch 
                  id="about-section-switch"
                  checked={showAboutSection}
                  onCheckedChange={handleShowAboutSectionChange}
                />
              </div>
              <p className="text-sm text-gray-500">
                Exibe a seção Quem Somos na página inicial
              </p>
            </div>
            
            <div className="pt-4 space-y-3">
              <div>
                <Label htmlFor="about-title" className="text-sm font-medium">
                  Título da Seção
                </Label>
                <Input 
                  id="about-title"
                  value={aboutTitle}
                  onChange={handleAboutTitleChange}
                  placeholder="Quem Somos"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="about-subtitle" className="text-sm font-medium">
                  Subtítulo da Seção
                </Label>
                <Input 
                  id="about-subtitle"
                  value={aboutSubtitle}
                  onChange={handleAboutSubtitleChange}
                  placeholder="Conheça Nossa História"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="about-description" className="text-sm font-medium">
                  Descrição
                </Label>
                <Textarea 
                  id="about-description"
                  value={aboutDescription}
                  onChange={handleAboutDescriptionChange}
                  placeholder="Descreva sua empresa, história e diferenciais..."
                  className="mt-1 min-h-[150px]"
                />
              </div>
              
              <div>
                <Label htmlFor="about-image" className="text-sm font-medium">
                  Imagem da Seção
                </Label>
                <div className="mt-1">
                  {config?.aboutImage ? (
                    <div className="relative">
                      <img 
                        src={config.aboutImage} 
                        alt="About section" 
                        className="w-full h-48 object-cover rounded-md"
                      />
                      {/* Componente de upload seria implementado aqui */}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center">
                      <div className="text-center">
                        <svg 
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          Faça upload de uma imagem para a seção Quem Somos
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}