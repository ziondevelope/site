import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SystemSettings from "@/components/settings/SystemSettings";
import SalesFunnelSettings from "@/components/settings/SalesFunnelSettings";
import { WebsiteConfig } from "@shared/schema";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("salesfunnel");

  // Buscar as configurações do sistema
  const { data: config, isLoading } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
  });

  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações do seu sistema e funis de vendas"
      />

      <Card className="overflow-hidden">
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b px-4">
            <TabsList className="h-auto py-2 bg-transparent justify-start">
              <TabsTrigger
                value="salesfunnel"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
              >
                Funil de Vendas
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
              >
                Configuração do Sistema
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="salesfunnel" className="p-6">
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