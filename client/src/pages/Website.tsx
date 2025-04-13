import { useState } from "react";
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
    queryKey: ['/api/website/config'],
    onSuccess: (data: WebsiteConfig) => {
      // Pre-initialize configData with current values
      setConfigData({
        logo: data.logo,
        bannerBackground: data.bannerBackground,
        mainFont: data.mainFont,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        footerInfo: data.footerInfo,
        showSearchBar: data.showSearchBar,
        showFeaturedProperties: data.showFeaturedProperties,
        showSaleProperties: data.showSaleProperties,
        showRentProperties: data.showRentProperties,
        showTestimonials: data.showTestimonials,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      });
    }
  });

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
      primaryColor: configData.primaryColor ?? config.primaryColor ?? '#3B82F6',
      secondaryColor: configData.secondaryColor ?? config.secondaryColor ?? '#10B981',
      footerInfo: configData.footerInfo ?? config.footerInfo ?? '',
      showSearchBar: configData.showSearchBar ?? config.showSearchBar ?? true,
      showFeaturedProperties: configData.showFeaturedProperties ?? config.showFeaturedProperties ?? true,
      showSaleProperties: configData.showSaleProperties ?? config.showSaleProperties ?? true,
      showRentProperties: configData.showRentProperties ?? config.showRentProperties ?? true,
      showTestimonials: configData.showTestimonials ?? config.showTestimonials ?? true,
      seoTitle: configData.seoTitle ?? config.seoTitle ?? '',
      seoDescription: configData.seoDescription ?? config.seoDescription ?? '',
      seoKeywords: configData.seoKeywords ?? config.seoKeywords ?? '',
    };
    
    saveConfigMutation.mutate(fullConfig);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Configuração do Site</h2>
        <div>
          <button 
            className={`bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition flex items-center
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
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <ConfigTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          config={config}
          onConfigChange={handleConfigChange}
          configData={configData}
        />
      )}
    </div>
  );
}
