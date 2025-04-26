import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettings from "@/components/website/GeneralSettings";
import HomepageSettings from "@/components/website/HomepageSettings";
import SeoSettings from "@/components/website/SeoSettings";
import InformationSettings from "@/components/website/InformationSettings";
import { TestimonialsManager } from "@/components/website/TestimonialsManager";
import ChatSettings from "@/components/website/ChatSettings";
import SliderSettings from "@/components/website/SliderSettings";
import IntegrationSettings from "@/components/website/IntegrationSettings";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";
import { 
  Settings, 
  Info, 
  Home, 
  Search, 
  MessageSquareQuote, 
  SlidersHorizontal,
  MessageCircle, 
  Share2,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";

interface ConfigTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function ConfigTabs({ 
  activeTab, 
  onTabChange, 
  config, 
  configData, 
  onConfigChange 
}: ConfigTabsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Verificar se a tela é mobile ao carregar e ao redimensionar
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Verificar uma vez ao carregar
    checkIsMobile();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkIsMobile);
    
    // Limpar listener ao desmontar
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Fecha o menu mobile ao selecionar uma aba
  const handleTabChange = (value: string) => {
    onTabChange(value);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        {isMobile ? (
          // Layout móvel com dropdown
          <div className="border-b border-gray-200 bg-gray-50">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="flex items-center gap-2 font-medium">
                {activeTab === "general" && <Settings size={18} />}
                {activeTab === "information" && <Info size={18} />}
                {activeTab === "homepage" && <Home size={18} />}
                {activeTab === "seo" && <Search size={18} />}
                {activeTab === "testimonials" && <MessageSquareQuote size={18} />}
                {activeTab === "slider" && <SlidersHorizontal size={18} />}
                {activeTab === "chat" && <MessageCircle size={18} />}
                {activeTab === "integration" && <Share2 size={18} />}
                {activeTab === "general" && "Configurações Gerais"}
                {activeTab === "information" && "Informações Gerais"}
                {activeTab === "homepage" && "Página Inicial"}
                {activeTab === "seo" && "SEO"}
                {activeTab === "testimonials" && "Depoimentos"}
                {activeTab === "slider" && "Slider de Imóveis"}
                {activeTab === "chat" && "Chat WhatsApp"}
                {activeTab === "integration" && "Integração"}
              </div>
              <div>
                {isMenuOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </div>
            
            {isMenuOpen && (
              <div className="border-t border-gray-200 max-h-80 overflow-y-auto">
                <TabsList className="h-auto bg-transparent flex flex-col w-full">
                  <TabsTrigger 
                    value="general" 
                    className="px-4 py-3 justify-start gap-3 data-[state=active]:border-l-4 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
                  >
                    <Settings size={18} className="text-gray-500" />
                    Configurações Gerais
                  </TabsTrigger>
                  <TabsTrigger 
                    value="information" 
                    className="px-4 py-3 justify-start gap-3 data-[state=active]:border-l-4 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
                  >
                    <Info size={18} className="text-gray-500" />
                    Informações Gerais
                  </TabsTrigger>
                  <TabsTrigger 
                    value="homepage" 
                    className="px-4 py-3 justify-start gap-3 data-[state=active]:border-l-4 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
                  >
                    <Home size={18} className="text-gray-500" />
                    Página Inicial
                  </TabsTrigger>
                  <TabsTrigger 
                    value="seo" 
                    className="px-4 py-3 justify-start gap-3 data-[state=active]:border-l-4 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
                  >
                    <Search size={18} className="text-gray-500" />
                    SEO
                  </TabsTrigger>
                  <TabsTrigger 
                    value="testimonials" 
                    className="px-4 py-3 justify-start gap-3 data-[state=active]:border-l-4 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
                  >
                    <MessageSquareQuote size={18} className="text-gray-500" />
                    Depoimentos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="slider" 
                    className="px-4 py-3 justify-start gap-3 data-[state=active]:border-l-4 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
                  >
                    <SlidersHorizontal size={18} className="text-gray-500" />
                    Slider de Imóveis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat" 
                    className="px-4 py-3 justify-start gap-3 data-[state=active]:border-l-4 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
                  >
                    <MessageCircle size={18} className="text-gray-500" />
                    Chat WhatsApp
                  </TabsTrigger>
                  <TabsTrigger 
                    value="integration" 
                    className="px-4 py-3 justify-start gap-3 data-[state=active]:border-l-4 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
                  >
                    <Share2 size={18} className="text-gray-500" />
                    Integração
                  </TabsTrigger>
                </TabsList>
              </div>
            )}
          </div>
        ) : (
          // Layout desktop com abas horizontais
          <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
            <TabsList className="h-auto bg-transparent flex-nowrap min-w-max">
              <TabsTrigger 
                value="general" 
                className="px-5 py-4 flex items-center gap-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
              >
                <Settings size={16} />
                <span>Configurações Gerais</span>
              </TabsTrigger>
              <TabsTrigger 
                value="information" 
                className="px-5 py-4 flex items-center gap-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
              >
                <Info size={16} />
                <span>Informações Gerais</span>
              </TabsTrigger>
              <TabsTrigger 
                value="homepage" 
                className="px-5 py-4 flex items-center gap-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
              >
                <Home size={16} />
                <span>Página Inicial</span>
              </TabsTrigger>
              <TabsTrigger 
                value="seo" 
                className="px-5 py-4 flex items-center gap-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
              >
                <Search size={16} />
                <span>SEO</span>
              </TabsTrigger>
              <TabsTrigger 
                value="testimonials" 
                className="px-5 py-4 flex items-center gap-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
              >
                <MessageSquareQuote size={16} />
                <span>Depoimentos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="slider" 
                className="px-5 py-4 flex items-center gap-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
              >
                <SlidersHorizontal size={16} />
                <span>Slider de Imóveis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="px-5 py-4 flex items-center gap-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
              >
                <MessageCircle size={16} />
                <span>Chat WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger 
                value="integration" 
                className="px-5 py-4 flex items-center gap-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
              >
                <Share2 size={16} />
                <span>Integração</span>
              </TabsTrigger>
            </TabsList>
          </div>
        )}
        
        <TabsContent value="general" className="p-6 bg-white">
          <GeneralSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="information" className="p-6 bg-white">
          <InformationSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="homepage" className="p-6 bg-white">
          <HomepageSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="seo" className="p-6 bg-white">
          <SeoSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="testimonials" className="p-6 bg-white">
          <TestimonialsManager />
        </TabsContent>
        
        <TabsContent value="slider" className="p-6 bg-white">
          <SliderSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="chat" className="p-6 bg-white">
          <ChatSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="integration" className="p-6 bg-white">
          <IntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
