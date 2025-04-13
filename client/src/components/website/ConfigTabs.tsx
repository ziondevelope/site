import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettings from "@/components/website/GeneralSettings";
import HomepageSettings from "@/components/website/HomepageSettings";
import SeoSettings from "@/components/website/SeoSettings";
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
    <Card>
      <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
        <div className="border-b border-gray-200">
          <TabsList className="h-auto">
            <TabsTrigger 
              value="general" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none"
            >
              Configurações Gerais
            </TabsTrigger>
            <TabsTrigger 
              value="homepage" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none"
            >
              Página Inicial
            </TabsTrigger>
            <TabsTrigger 
              value="seo" 
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none"
            >
              SEO
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="general" className="p-6">
          <GeneralSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="homepage" className="p-6">
          <HomepageSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
        
        <TabsContent value="seo" className="p-6">
          <SeoSettings 
            config={config} 
            configData={configData}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
