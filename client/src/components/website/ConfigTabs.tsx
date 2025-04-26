import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettings from "@/components/website/GeneralSettings";
import HomepageSettings from "@/components/website/HomepageSettings";
import SeoSettings from "@/components/website/SeoSettings";
import InformationSettings from "@/components/website/InformationSettings";
import { TestimonialsManager } from "@/components/website/TestimonialsManager";
import ChatSettings from "@/components/website/ChatSettings";
import SliderSettings from "@/components/website/SliderSettings";
import PortalSettings from "@/components/website/PortalSettings";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";

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
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
        <div className="border-b border-gray-200 bg-gray-50">
          <TabsList className="h-auto bg-transparent">
            <TabsTrigger 
              value="general" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              Configurações Gerais
            </TabsTrigger>
            <TabsTrigger 
              value="information" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              Informações Gerais
            </TabsTrigger>
            <TabsTrigger 
              value="homepage" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              Página Inicial
            </TabsTrigger>
            <TabsTrigger 
              value="seo" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              SEO
            </TabsTrigger>
            <TabsTrigger 
              value="testimonials" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              Depoimentos
            </TabsTrigger>
            <TabsTrigger 
              value="slider" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              Slider de Imóveis
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              Chat WhatsApp
            </TabsTrigger>
            <TabsTrigger 
              value="portal" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              Adicionar Portal
            </TabsTrigger>
          </TabsList>
        </div>
        
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
        
        <TabsContent value="portal" className="p-6 bg-white">
          <PortalSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
