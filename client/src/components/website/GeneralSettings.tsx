import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { WebsiteConfig, UpdateWebsiteConfig } from "@shared/schema";

interface GeneralSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

export default function GeneralSettings({ config, configData, onConfigChange }: GeneralSettingsProps) {
  // These are derived values that reflect either the current editing state (configData)
  // or fallback to the saved values (config) if no edits have been made
  const logo = configData.logo !== undefined 
    ? configData.logo 
    : config?.logo || '';
    
  const bannerBg = configData.bannerBackground !== undefined 
    ? configData.bannerBackground 
    : config?.bannerBackground || '';
    
  const mainFont = configData.mainFont !== undefined 
    ? configData.mainFont 
    : config?.mainFont || 'Inter';
    
  const primaryColor = configData.primaryColor !== undefined 
    ? configData.primaryColor 
    : config?.primaryColor || '#3B82F6';
    
  const secondaryColor = configData.secondaryColor !== undefined 
    ? configData.secondaryColor 
    : config?.secondaryColor || '#10B981';
    
  const footerInfo = configData.footerInfo !== undefined 
    ? configData.footerInfo 
    : config?.footerInfo || '';

  // Handle change functions
  const handleLogoChange = (newValue: string) => {
    onConfigChange({ logo: newValue });
  };

  const handleBannerBgChange = (newValue: string) => {
    onConfigChange({ bannerBackground: newValue });
  };

  const handleMainFontChange = (newValue: string) => {
    onConfigChange({ mainFont: newValue });
  };

  const handlePrimaryColorChange = (newValue: string) => {
    onConfigChange({ primaryColor: newValue });
  };

  const handleSecondaryColorChange = (newValue: string) => {
    onConfigChange({ secondaryColor: newValue });
  };

  const handleFooterInfoChange = (newValue: string) => {
    onConfigChange({ footerInfo: newValue });
  };

  // Placeholder URL for demo purposes
  const demoLogoUrl = 'https://placehold.co/200x100/3B82F6/FFFFFF?text=Logo';
  const demoBannerUrl = 'https://placehold.co/800x400/10B981/FFFFFF?text=Banner';
  
  const addDemoLogo = () => {
    handleLogoChange(demoLogoUrl);
  };
  
  const addDemoBanner = () => {
    handleBannerBgChange(demoBannerUrl);
  };
  
  const removeLogo = () => {
    handleLogoChange('');
  };
  
  const removeBanner = () => {
    handleBannerBgChange('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </Label>
          <div className="flex items-center space-x-4">
            <ImageUpload
              currentImage={logo}
              onImageChange={handleLogoChange}
              onRemoveImage={removeLogo}
              label="Upload Logo"
            />
            <Button 
              variant="outline" 
              className="rounded-full"
              onClick={addDemoLogo}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" x2="22" y1="5" y2="5"></line><line x1="19" x2="19" y1="2" y2="8"></line><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
              Demo Logo
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Background do Banner
          </Label>
          <div className="flex items-center space-x-4">
            <ImageUpload
              currentImage={bannerBg}
              onImageChange={handleBannerBgChange}
              onRemoveImage={removeBanner}
              previewClassName="w-32 h-32"
              label="Upload Banner"
            />
            <Button 
              variant="outline" 
              className="rounded-full"
              onClick={addDemoBanner}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" x2="22" y1="5" y2="5"></line><line x1="19" x2="19" y1="2" y2="8"></line><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
              Demo Banner
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Fonte Principal
          </Label>
          <select 
            className="w-full border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            value={mainFont}
            onChange={(e) => handleMainFontChange(e.target.value)}
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
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              className="h-10 w-10 border-0 rounded-l-lg p-0"
            />
            <Input 
              type="text" 
              value={primaryColor} 
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
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
              onChange={(e) => handleSecondaryColorChange(e.target.value)}
              className="h-10 w-10 border-0 rounded-l-lg p-0"
            />
            <Input 
              type="text" 
              value={secondaryColor} 
              onChange={(e) => handleSecondaryColorChange(e.target.value)}
              className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
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
          className="w-full rounded-xl"
          placeholder="Endereço, contato, horário de funcionamento..."
          value={footerInfo}
          onChange={(e) => handleFooterInfoChange(e.target.value)}
        />
      </div>
    </div>
  );
}
