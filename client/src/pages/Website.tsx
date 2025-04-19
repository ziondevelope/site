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
        bannerBackground: config.bannerBackground,
        mainFont: config.mainFont,
        headingFont: config.headingFont,
        bodyFont: config.bodyFont,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        footerInfo: config.footerInfo,
        bannerTitle: config.bannerTitle,
        bannerSubtitle: config.bannerSubtitle,
        showBannerText: config.showBannerText,
        showSearchBar: config.showSearchBar,
        showFeaturedProperties: config.showFeaturedProperties,
        showSaleProperties: config.showSaleProperties,
        showRentProperties: config.showRentProperties,
        showTestimonials: config.showTestimonials,
        // Informações de contato
        address: config.address,
        email: config.email,
        phone: config.phone,
        workingHours: config.workingHours,
        // SEO
        seoTitle: config.seoTitle,
        seoDescription: config.seoDescription,
        seoKeywords: config.seoKeywords,
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
    setConfigData(prev => ({
      ...prev,
      ...partialConfig
    }));
  };

  // Handle save button click
  const handleSave = () => {
    if (!config) return;
    
    // Create a full config object ensuring all properties have values
    const fullConfig: UpdateWebsiteConfig = {
      logo: configData.logo ?? config.logo ?? '',
      bannerBackground: configData.bannerBackground ?? config.bannerBackground ?? '',
      mainFont: configData.mainFont ?? config.mainFont ?? 'Inter',
      headingFont: configData.headingFont ?? config.headingFont ?? 'Inter',
      bodyFont: configData.bodyFont ?? config.bodyFont ?? 'Inter',
      primaryColor: configData.primaryColor ?? config.primaryColor ?? '#3B82F6',
      secondaryColor: configData.secondaryColor ?? config.secondaryColor ?? '#10B981',
      footerInfo: configData.footerInfo ?? config.footerInfo ?? '',
      bannerTitle: configData.bannerTitle ?? config.bannerTitle ?? 'Encontre o imóvel dos seus sonhos',
      bannerSubtitle: configData.bannerSubtitle ?? config.bannerSubtitle ?? 'Oferecemos as melhores opções de imóveis para compra e aluguel com atendimento personalizado.',
      showBannerText: configData.showBannerText ?? config.showBannerText ?? true,
      showSearchBar: configData.showSearchBar ?? config.showSearchBar ?? true,
      showFeaturedProperties: configData.showFeaturedProperties ?? config.showFeaturedProperties ?? true,
      showSaleProperties: configData.showSaleProperties ?? config.showSaleProperties ?? true,
      showRentProperties: configData.showRentProperties ?? config.showRentProperties ?? true,
      showTestimonials: configData.showTestimonials ?? config.showTestimonials ?? true,
      // Informações de contato
      address: configData.address ?? config.address ?? '',
      email: configData.email ?? config.email ?? '',
      phone: configData.phone ?? config.phone ?? '',
      workingHours: configData.workingHours ?? config.workingHours ?? '',
      // SEO
      seoTitle: configData.seoTitle ?? config.seoTitle ?? '',
      seoDescription: configData.seoDescription ?? config.seoDescription ?? '',
      seoKeywords: configData.seoKeywords ?? config.seoKeywords ?? '',
    };
    
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
