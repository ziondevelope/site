import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettings from "@/components/website/GeneralSettings";
import HomepageSettings from "@/components/website/HomepageSettings";
import SeoSettings from "@/components/website/SeoSettings";
import InformationSettings from "@/components/website/InformationSettings";
import SalesFunnelSettings from "@/components/website/SalesFunnelSettings";
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
              value="salesfunnel" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none data-[state=active]:bg-white"
            >
              Funil de Vendas
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
        
        <TabsContent value="salesfunnel" className="p-6 bg-white">
          <SalesFunnelSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
