import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { WebsiteConfig } from "@shared/schema";

interface HomepageSettingsProps {
  config?: WebsiteConfig;
}

export default function HomepageSettings({ config }: HomepageSettingsProps) {
  const [showSearchBar, setShowSearchBar] = useState(config?.showSearchBar ?? true);
  const [showFeaturedProperties, setShowFeaturedProperties] = useState(config?.showFeaturedProperties ?? true);
  const [showSaleProperties, setShowSaleProperties] = useState(config?.showSaleProperties ?? true);
  const [showRentProperties, setShowRentProperties] = useState(config?.showRentProperties ?? true);
  const [showTestimonials, setShowTestimonials] = useState(config?.showTestimonials ?? false);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg border-b pb-2">Componentes da Página Inicial</h3>
      
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="font-medium">Barra de Pesquisa</p>
          <p className="text-sm text-gray-500">Exibe a barra de pesquisa de imóveis no topo do site</p>
        </div>
        <Switch 
          checked={showSearchBar} 
          onCheckedChange={setShowSearchBar} 
          className="data-[state=checked]:bg-primary"
        />
      </div>
      
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Imóveis em Destaque</p>
          <p className="text-sm text-gray-500">Exibe carrossel de imóveis em destaque</p>
        </div>
        <Switch 
          checked={showFeaturedProperties} 
          onCheckedChange={setShowFeaturedProperties} 
          className="data-[state=checked]:bg-primary"
        />
      </div>
      
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Imóveis para Venda</p>
          <p className="text-sm text-gray-500">Exibe seção de imóveis para venda</p>
        </div>
        <Switch 
          checked={showSaleProperties} 
          onCheckedChange={setShowSaleProperties} 
          className="data-[state=checked]:bg-primary"
        />
      </div>
      
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Imóveis para Alugar</p>
          <p className="text-sm text-gray-500">Exibe seção de imóveis para locação</p>
        </div>
        <Switch 
          checked={showRentProperties} 
          onCheckedChange={setShowRentProperties} 
          className="data-[state=checked]:bg-primary"
        />
      </div>
      
      <div className="flex items-center justify-between py-2 border-t">
        <div>
          <p className="font-medium">Depoimentos</p>
          <p className="text-sm text-gray-500">Exibe depoimentos de clientes</p>
        </div>
        <Switch 
          checked={showTestimonials} 
          onCheckedChange={setShowTestimonials}
          className="data-[state=checked]:bg-primary"
        />
      </div>
      
      <div className="pt-4">
        <Button>
          Visualizar Prévia
        </Button>
      </div>
    </div>
  );
}
