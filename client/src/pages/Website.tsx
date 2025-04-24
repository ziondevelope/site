import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ConfigTabs from "@/components/website/ConfigTabs";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";

export default function Website() {
  const [activeTab, setActiveTab] = useState("general");
  const [configData, setConfigData] = useState<Partial<UpdateWebsiteConfig>>({});
  const { toast } = useToast();
  
  // Fetch website configuration
  const { data: config, isLoading } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config']
  });

  // Quando os dados de configuração forem carregados, inicialize o estado local
  useEffect(() => {
    if (config) {
      setConfigData({
        logo: config.logo,
        footerLogo: config.footerLogo,
        bannerBackground: config.bannerBackground,
        mainFont: config.mainFont,
        headingFont: config.headingFont,
        bodyFont: config.bodyFont,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        footerTextColor: config.footerTextColor,
        footerIconsColor: config.footerIconsColor,
        footerInfo: config.footerInfo,
        footerStyle: config.footerStyle,
        bannerTitle: config.bannerTitle,
        bannerSubtitle: config.bannerSubtitle,
        showBannerText: config.showBannerText,
        showSearchBar: config.showSearchBar,
        showFeaturedProperties: config.showFeaturedProperties,
        showSaleProperties: config.showSaleProperties,
        showRentProperties: config.showRentProperties,
        showTestimonials: config.showTestimonials,
        // Cards de Qualidade
        showQualityCards: config.showQualityCards,
        qualityCard1Title: config.qualityCard1Title,
        qualityCard1Text: config.qualityCard1Text,
        qualityCard1Enabled: config.qualityCard1Enabled,
        qualityCard2Title: config.qualityCard2Title,
        qualityCard2Text: config.qualityCard2Text,
        qualityCard2Enabled: config.qualityCard2Enabled,
        qualityCard3Title: config.qualityCard3Title,
        qualityCard3Text: config.qualityCard3Text,
        qualityCard3Enabled: config.qualityCard3Enabled,
        // Informações de contato
        address: config.address,
        email: config.email,
        phone: config.phone,
        workingHours: config.workingHours,
        // Redes sociais
        instagramUrl: config.instagramUrl,
        facebookUrl: config.facebookUrl,
        youtubeUrl: config.youtubeUrl,
        linkedinUrl: config.linkedinUrl,
        tiktokUrl: config.tiktokUrl,
        // SEO
        seoTitle: config.seoTitle,
        seoDescription: config.seoDescription,
        seoKeywords: config.seoKeywords,
        // WhatsApp Chat
        whatsappChatEnabled: config.whatsappChatEnabled,
        whatsappNumber: config.whatsappNumber,
        whatsappMessage: config.whatsappMessage,
        whatsappButtonText: config.whatsappButtonText,
        whatsappButtonPosition: config.whatsappButtonPosition,
        whatsappFormEnabled: config.whatsappFormEnabled,
        whatsappFormTitle: config.whatsappFormTitle,
        whatsappFormMessage: config.whatsappFormMessage,
        
        // Cores da página de detalhes
        propertyDetailsBackgroundColor: config.propertyDetailsBackgroundColor,
        propertyDetailsTextColor: config.propertyDetailsTextColor,
        propertyDetailsIconsColor: config.propertyDetailsIconsColor,
      });
    }
  }, [config]);

  // Mutation to save configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (data: UpdateWebsiteConfig) => {
      return apiRequest<WebsiteConfig>('/api/website/config', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/website/config'] });
      toast({
        title: "Configurações salvas",
        description: "As configurações do site foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error saving website config:", error);
    }
  });
  
  // Handle configuration changes from child components
  const handleConfigChange = (partialConfig: Partial<UpdateWebsiteConfig>) => {
    console.log("handleConfigChange recebeu:", partialConfig);
    
    // Verificar especificamente se temos um favicon chegando
    if (partialConfig.favicon) {
      console.log("Favicon detectado no handleConfigChange, primeiros 50 caracteres:", 
        partialConfig.favicon.substring(0, 50));
    }
    
    setConfigData(prev => {
      const newState = {
        ...prev,
        ...partialConfig
      };
      
      console.log("configData atualizado, tem favicon?", !!newState.favicon);
      return newState;
    });
  };

  // Handle save button click
  const handleSave = () => {
    if (!config) return;
    
    // Debug para rodapé
    console.log("Estado atual configData:", {
      footerTextColor: configData.footerTextColor,
      footerIconsColor: configData.footerIconsColor,
      configFooterTextColor: config.footerTextColor,
      configFooterIconsColor: config.footerIconsColor,
      // Redes sociais
      instagramUrl: configData.instagramUrl,
      facebookUrl: configData.facebookUrl,
      youtubeUrl: configData.youtubeUrl,
      linkedinUrl: configData.linkedinUrl,
      tiktokUrl: configData.tiktokUrl,
      // Redes sociais da configuração
      configInstagramUrl: config.instagramUrl,
      configFacebookUrl: config.facebookUrl,
      configYoutubeUrl: config.youtubeUrl,
      configLinkedinUrl: config.linkedinUrl,
      configTiktokUrl: config.tiktokUrl,
      // Seção Quem Somos
      aboutTitle: configData.aboutTitle,
      aboutSubtitle: configData.aboutSubtitle,
      aboutDescription: configData.aboutDescription,
      showAboutSection: configData.showAboutSection,
      // Valores da configuração
      configAboutTitle: config.aboutTitle,
      configAboutSubtitle: config.aboutSubtitle,
      configAboutDescription: config.aboutDescription,
      configShowAboutSection: config.showAboutSection
    });
    
    // Debug de SEO e favicon
    console.log("Verificando favicon antes de salvar:");
    console.log("Favicon em configData?", !!configData.favicon);
    console.log("Favicon em config?", !!config.favicon);
    
    if (configData.favicon) {
      console.log("Primeiros 50 caracteres do favicon em configData:", configData.favicon.substring(0, 50));
    }
    
    // Create a full config object ensuring all properties have values
    const fullConfig: UpdateWebsiteConfig = {
      logo: configData.logo ?? config.logo ?? '',
      footerLogo: configData.footerLogo ?? config.footerLogo ?? '',
      bannerBackground: configData.bannerBackground ?? config.bannerBackground ?? '',
      mainFont: configData.mainFont ?? config.mainFont ?? 'Inter',
      headingFont: configData.headingFont ?? config.headingFont ?? 'Inter',
      bodyFont: configData.bodyFont ?? config.bodyFont ?? 'Inter',
      primaryColor: configData.primaryColor ?? config.primaryColor ?? '#3B82F6',
      secondaryColor: configData.secondaryColor ?? config.secondaryColor ?? '#10B981',
      footerTextColor: configData.footerTextColor || config.footerTextColor || '#ffffff',
      footerIconsColor: configData.footerIconsColor || config.footerIconsColor || '',
      footerInfo: configData.footerInfo ?? config.footerInfo ?? '',
      footerStyle: configData.footerStyle ?? config.footerStyle ?? 'default',
      bannerTitle: configData.bannerTitle ?? config.bannerTitle ?? 'Encontre o imóvel dos seus sonhos',
      bannerSubtitle: configData.bannerSubtitle ?? config.bannerSubtitle ?? 'Oferecemos as melhores opções de imóveis para compra e aluguel com atendimento personalizado.',
      showBannerText: configData.showBannerText ?? config.showBannerText ?? true,
      showSearchBar: configData.showSearchBar ?? config.showSearchBar ?? true,
      showFeaturedProperties: configData.showFeaturedProperties ?? config.showFeaturedProperties ?? true,
      showSaleProperties: configData.showSaleProperties ?? config.showSaleProperties ?? true,
      showRentProperties: configData.showRentProperties ?? config.showRentProperties ?? true,
      showTestimonials: configData.showTestimonials ?? config.showTestimonials ?? true,
      
      // Cards de Qualidade
      showQualityCards: configData.showQualityCards ?? config.showQualityCards ?? true,
      qualityCard1Title: configData.qualityCard1Title ?? config.qualityCard1Title ?? 'Os melhores imóveis',
      qualityCard1Text: configData.qualityCard1Text ?? config.qualityCard1Text ?? 'Escolha entre apartamentos, casas, salas, ... Considere uma visita com um dos nossos corretores',
      qualityCard1Enabled: configData.qualityCard1Enabled ?? config.qualityCard1Enabled ?? true,
      qualityCard2Title: configData.qualityCard2Title ?? config.qualityCard2Title ?? 'Vamos acompanhar você',
      qualityCard2Text: configData.qualityCard2Text ?? config.qualityCard2Text ?? 'Oferecemos a você a melhor consultoria na escolha do seu imóvel, desde a escolha da localização, tipo e características',
      qualityCard2Enabled: configData.qualityCard2Enabled ?? config.qualityCard2Enabled ?? true,
      qualityCard3Title: configData.qualityCard3Title ?? config.qualityCard3Title ?? 'Sempre a melhor condição',
      qualityCard3Text: configData.qualityCard3Text ?? config.qualityCard3Text ?? 'Nossa equipe irá buscar a melhor condição de fechamento, inclusive oferecendo consultoria no financiamento',
      qualityCard3Enabled: configData.qualityCard3Enabled ?? config.qualityCard3Enabled ?? true,
      
      // Informações de contato
      address: configData.address ?? config.address ?? '',
      email: configData.email ?? config.email ?? '',
      phone: configData.phone ?? config.phone ?? '',
      workingHours: configData.workingHours ?? config.workingHours ?? '',
      // Redes sociais
      instagramUrl: configData.instagramUrl ?? config.instagramUrl ?? '',
      facebookUrl: configData.facebookUrl ?? config.facebookUrl ?? '',
      youtubeUrl: configData.youtubeUrl ?? config.youtubeUrl ?? '',
      linkedinUrl: configData.linkedinUrl ?? config.linkedinUrl ?? '',
      tiktokUrl: configData.tiktokUrl ?? config.tiktokUrl ?? '',
      // Seção Quem Somos
      aboutTitle: configData.aboutTitle ?? config.aboutTitle ?? 'Quem Somos',
      aboutSubtitle: configData.aboutSubtitle ?? config.aboutSubtitle ?? 'Conheça Nossa História',
      aboutDescription: configData.aboutDescription ?? config.aboutDescription ?? '',
      aboutImage: configData.aboutImage ?? config.aboutImage ?? '',
      showAboutSection: configData.showAboutSection ?? config.showAboutSection ?? true,
      // SEO
      seoTitle: configData.seoTitle ?? config.seoTitle ?? '',
      seoDescription: configData.seoDescription ?? config.seoDescription ?? '',
      seoKeywords: configData.seoKeywords ?? config.seoKeywords ?? '',
      favicon: configData.favicon ?? config.favicon ?? '',
      
      // WhatsApp Chat
      whatsappChatEnabled: configData.whatsappChatEnabled ?? config.whatsappChatEnabled ?? false,
      whatsappNumber: configData.whatsappNumber ?? config.whatsappNumber ?? '',
      whatsappMessage: configData.whatsappMessage ?? config.whatsappMessage ?? 'Olá! Gostaria de mais informações sobre um imóvel.',
      whatsappButtonText: configData.whatsappButtonText ?? config.whatsappButtonText ?? 'Falar com corretor',
      whatsappButtonPosition: configData.whatsappButtonPosition ?? config.whatsappButtonPosition ?? 'right',
      whatsappFormEnabled: configData.whatsappFormEnabled ?? config.whatsappFormEnabled ?? true,
      whatsappFormTitle: configData.whatsappFormTitle ?? config.whatsappFormTitle ?? 'Entre em contato com um corretor',
      whatsappFormMessage: configData.whatsappFormMessage ?? config.whatsappFormMessage ?? 'Preencha seus dados para que um de nossos corretores possa lhe atender da melhor forma.',
      
      // Cores da página de detalhes do imóvel
      propertyDetailsBackgroundColor: configData.propertyDetailsBackgroundColor ?? config.propertyDetailsBackgroundColor ?? (configData.primaryColor ?? config.primaryColor ?? '#3B82F6'),
      propertyDetailsTextColor: configData.propertyDetailsTextColor ?? config.propertyDetailsTextColor ?? '#ffffff',
      propertyDetailsIconsColor: configData.propertyDetailsIconsColor ?? config.propertyDetailsIconsColor ?? '#f0f0f0',
    };
    
    // Log das cores da página de detalhes para depuração
    console.log("Cores da página de detalhes ao salvar:", {
      configData: {
        background: configData.propertyDetailsBackgroundColor,
        text: configData.propertyDetailsTextColor,
        icons: configData.propertyDetailsIconsColor
      },
      config: {
        background: config.propertyDetailsBackgroundColor,
        text: config.propertyDetailsTextColor,
        icons: config.propertyDetailsIconsColor
      },
      fullConfig: {
        background: fullConfig.propertyDetailsBackgroundColor,
        text: fullConfig.propertyDetailsTextColor,
        icons: fullConfig.propertyDetailsIconsColor
      }
    });
    
    saveConfigMutation.mutate(fullConfig);
  };

  return (
    <div className="space-y-6">
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <ConfigTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            config={config}
            onConfigChange={handleConfigChange}
            configData={configData}
          />
          
          <div className="mt-6 flex justify-end">
            <button 
              className={`bg-[#15616D] text-white px-5 py-2 rounded-full font-medium hover:bg-[#15616D]/90 transition flex items-center
                ${saveConfigMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleSave}
              disabled={saveConfigMutation.isPending}
            >
              {saveConfigMutation.isPending ? (
                <>
                  <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
