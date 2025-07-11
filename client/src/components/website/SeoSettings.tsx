import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";
import { useState, useEffect } from "react";

interface SeoSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function SeoSettings({ config, configData, onConfigChange }: SeoSettingsProps) {
  // Estado para armazenar o domínio atual
  const [currentDomain, setCurrentDomain] = useState<string>("");
  
  // Detectar o domínio atual
  useEffect(() => {
    const domain = window.location.hostname;
    // Usar dominio.com.br para previas, mas filtrar localhost e replit.dev
    if (domain === 'localhost' || domain.includes('replit.dev')) {
      setCurrentDomain('seudominio.com.br');
    } else {
      setCurrentDomain(domain);
    }
  }, []);
  
  // These are derived values that reflect either the current editing state (configData)
  // or fallback to the saved values (config) if no edits have been made
  const seoTitle = configData.seoTitle !== undefined 
    ? configData.seoTitle 
    : config?.seoTitle || "Imobiliária XYZ - Imóveis à venda e para alugar em São Paulo";
    
  const seoDescription = configData.seoDescription !== undefined 
    ? configData.seoDescription 
    : config?.seoDescription || "A Imobiliária XYZ oferece os melhores imóveis à venda e para alugar em São Paulo. Encontre apartamentos, casas, salas comerciais e terrenos com a ajuda de nossos corretores especializados.";
    
  const seoKeywords = configData.seoKeywords !== undefined 
    ? configData.seoKeywords 
    : config?.seoKeywords || "imobiliária, imóveis, apartamentos, casas, comprar, alugar, São Paulo";
    
  // Favicon - agora usando o campo específico para favicon
  const favicon = configData.favicon !== undefined
    ? configData.favicon
    : config?.favicon || config?.logo; // Usa logo como fallback se favicon não estiver definido

  // Handle change functions
  const handleSeoTitleChange = (newValue: string) => {
    onConfigChange({ seoTitle: newValue });
  };

  const handleSeoDescriptionChange = (newValue: string) => {
    onConfigChange({ seoDescription: newValue });
  };

  const handleSeoKeywordsChange = (newValue: string) => {
    onConfigChange({ seoKeywords: newValue });
  };
  
  const handleFaviconChange = (imageBase64: string) => {
    console.log("Atualizando favicon:", imageBase64.substring(0, 50) + "...");
    onConfigChange({ favicon: imageBase64 });
  };

  // Calculate character counts
  const titleLength = (seoTitle || '').length;
  const titleClass = titleLength > 70 ? "text-red-500" : titleLength < 40 ? "text-yellow-500" : "text-green-500";
  
  const descriptionLength = (seoDescription || '').length;
  const descriptionClass = descriptionLength > 160 ? "text-red-500" : descriptionLength < 120 ? "text-yellow-500" : "text-green-500";

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Título da Página (SEO)
        </Label>
        <Input 
          value={seoTitle || ''}
          onChange={(e) => handleSeoTitleChange(e.target.value)}
          className="rounded-full"
        />
        <div className="flex justify-between mt-1">
          <p className="text-sm text-gray-500">60-70 caracteres recomendados</p>
          <p className={`text-sm font-medium ${titleClass}`}>{titleLength} caracteres</p>
        </div>
      </div>
      
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição da Página (SEO)
        </Label>
        <Textarea 
          rows={3} 
          value={seoDescription || ''}
          onChange={(e) => handleSeoDescriptionChange(e.target.value)}
          className="rounded-xl"
        />
        <div className="flex justify-between mt-1">
          <p className="text-sm text-gray-500">150-160 caracteres recomendados</p>
          <p className={`text-sm font-medium ${descriptionClass}`}>{descriptionLength} caracteres</p>
        </div>
      </div>
      
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Palavras-chave
        </Label>
        <Input 
          value={seoKeywords || ''}
          onChange={(e) => handleSeoKeywordsChange(e.target.value)}
          className="rounded-full"
        />
        <p className="text-sm text-gray-500 mt-1">Separadas por vírgula</p>
      </div>
      
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Favicon
        </Label>
        <div className="flex items-start gap-4">
          <ImageUpload 
            currentImage={favicon || undefined}
            onImageChange={handleFaviconChange}
            previewClassName="w-16 h-16"
            label="Favicon"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">
              O favicon é o ícone que aparece na aba do navegador. Recomendamos usar o logotipo da sua imobiliária como favicon.
            </p>
            <p className="text-sm text-gray-500">
              Formato recomendado: quadrado, pelo menos 32x32 pixels.
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <h4 className="font-medium mb-2">Prévia nos Resultados de Busca</h4>
        <Card className="p-4 border border-gray-200 rounded-xl shadow-sm">
          <p className="text-xl text-blue-700 hover:underline cursor-pointer mb-1">{seoTitle}</p>
          <p className="text-green-700 text-sm mb-1">https://www.{currentDomain}/</p>
          <p className="text-sm text-gray-700">{seoDescription}</p>
        </Card>
      </div>
    </div>
  );
}
