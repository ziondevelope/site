import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/layout/PageHeader";
import SalesFunnelSettings from "@/components/website/SalesFunnelSettings";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { WebsiteConfig } from "@shared/schema";
import SystemSettings from "@/components/settings/SystemSettings";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("funnels");
  
  // Fetch website configuration for system settings
  const { data: config, isLoading } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config']
  });

  return (
    <div className="container py-6">
      <PageHeader 
        title="Configurações" 
        description="Gerencie as configurações do sistema e funis de vendas" 
      />
      
      <Card className="mt-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full border-b rounded-none bg-gray-50 p-0">
            <TabsTrigger 
              value="funnels" 
              className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
            >
              Funis de Vendas
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
            >
              Configuração do Sistema
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="funnels" className="p-6">
            <SalesFunnelSettings />
          </TabsContent>
          
          <TabsContent value="system" className="p-6">
            <SystemSettings config={config} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}