import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { WebsiteConfig } from "@shared/schema";

interface SeoSettingsProps {
  config?: WebsiteConfig;
}

export default function SeoSettings({ config }: SeoSettingsProps) {
  const [seoTitle, setSeoTitle] = useState(config?.seoTitle || "Imobiliária XYZ - Imóveis à venda e para alugar em São Paulo");
  const [seoDescription, setSeoDescription] = useState(config?.seoDescription || "A Imobiliária XYZ oferece os melhores imóveis à venda e para alugar em São Paulo. Encontre apartamentos, casas, salas comerciais e terrenos com a ajuda de nossos corretores especializados.");
  const [seoKeywords, setSeoKeywords] = useState(config?.seoKeywords || "imobiliária, imóveis, apartamentos, casas, comprar, alugar, São Paulo");

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Título da Página (SEO)
        </Label>
        <Input 
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">60-70 caracteres recomendados</p>
      </div>
      
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição da Página (SEO)
        </Label>
        <Textarea 
          rows={3} 
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">150-160 caracteres recomendados</p>
      </div>
      
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Palavras-chave
        </Label>
        <Input 
          value={seoKeywords}
          onChange={(e) => setSeoKeywords(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">Separadas por vírgula</p>
      </div>
      
      <div className="pt-4">
        <h4 className="font-medium mb-2">Prévia nos Resultados de Busca</h4>
        <Card className="p-4 border border-gray-200">
          <p className="text-xl text-blue-700 hover:underline cursor-pointer mb-1">{seoTitle}</p>
          <p className="text-green-700 text-sm mb-1">https://www.imobiliariaxyz.com.br/</p>
          <p className="text-sm text-gray-700">{seoDescription}</p>
        </Card>
      </div>
    </div>
  );
}
