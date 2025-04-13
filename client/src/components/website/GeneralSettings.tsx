import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WebsiteConfig } from "@shared/schema";

interface GeneralSettingsProps {
  config?: WebsiteConfig;
}

export default function GeneralSettings({ config }: GeneralSettingsProps) {
  const [logo, setLogo] = useState<string | null>(config?.logo || null);
  const [bannerBg, setBannerBg] = useState<string | null>(config?.bannerBackground || null);
  const [mainFont, setMainFont] = useState(config?.mainFont || "Inter");
  const [primaryColor, setPrimaryColor] = useState(config?.primaryColor || "#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState(config?.secondaryColor || "#10B981");
  const [footerInfo, setFooterInfo] = useState(config?.footerInfo || "");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </Label>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {logo ? (
                <img src={logo} alt="Logo Preview" className="max-w-full max-h-full" />
              ) : (
                <i className="ri-image-line text-3xl text-gray-400"></i>
              )}
            </div>
            <div>
              <Button variant="outline" className="mb-2 w-full">
                <i className="ri-upload-line mr-1"></i> Upload Logo
              </Button>
              <Button variant="ghost" className="text-gray-500 text-sm w-full">
                <i className="ri-delete-bin-line mr-1"></i> Remover
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Background do Banner
          </Label>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {bannerBg ? (
                <img src={bannerBg} alt="Banner Preview" className="max-w-full max-h-full" />
              ) : (
                <i className="ri-landscape-line text-3xl text-gray-400"></i>
              )}
            </div>
            <div>
              <Button variant="outline" className="mb-2 w-full">
                <i className="ri-upload-line mr-1"></i> Upload Background
              </Button>
              <Button variant="ghost" className="text-gray-500 text-sm w-full">
                <i className="ri-delete-bin-line mr-1"></i> Remover
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Fonte Principal
          </Label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={mainFont}
            onChange={(e) => setMainFont(e.target.value)}
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
          </select>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Cor Primária
          </Label>
          <div className="flex">
            <Input 
              type="color" 
              value={primaryColor} 
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-10 border-0 rounded-l-lg p-0"
            />
            <Input 
              type="text" 
              value={primaryColor} 
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Cor Secundária
          </Label>
          <div className="flex">
            <Input 
              type="color" 
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="h-10 w-10 border-0 rounded-l-lg p-0"
            />
            <Input 
              type="text" 
              value={secondaryColor} 
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Informações do Rodapé
        </Label>
        <Textarea 
          rows={4} 
          className="w-full"
          placeholder="Endereço, contato, horário de funcionamento..."
          value={footerInfo}
          onChange={(e) => setFooterInfo(e.target.value)}
        />
      </div>
    </div>
  );
}
