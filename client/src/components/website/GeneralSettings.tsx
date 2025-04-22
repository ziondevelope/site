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

  const headingFont = configData.headingFont !== undefined 
    ? configData.headingFont 
    : config?.headingFont || 'Inter';

  const bodyFont = configData.bodyFont !== undefined 
    ? configData.bodyFont 
    : config?.bodyFont || 'Inter';
    
  const primaryColor = configData.primaryColor !== undefined 
    ? configData.primaryColor 
    : config?.primaryColor || '#3B82F6';
    
  const secondaryColor = configData.secondaryColor !== undefined 
    ? configData.secondaryColor 
    : config?.secondaryColor || '#10B981';
    
  const footerTextColor = configData.footerTextColor !== undefined 
    ? configData.footerTextColor 
    : config?.footerTextColor || '#ffffff';
    
  const footerIconsColor = configData.footerIconsColor !== undefined 
    ? configData.footerIconsColor 
    : config?.footerIconsColor || primaryColor;
    
  // Redes sociais
  const instagramUrl = configData.instagramUrl !== undefined 
    ? configData.instagramUrl 
    : config?.instagramUrl || '';
    
  const facebookUrl = configData.facebookUrl !== undefined 
    ? configData.facebookUrl 
    : config?.facebookUrl || '';
    
  const youtubeUrl = configData.youtubeUrl !== undefined 
    ? configData.youtubeUrl 
    : config?.youtubeUrl || '';
    
  const linkedinUrl = configData.linkedinUrl !== undefined 
    ? configData.linkedinUrl 
    : config?.linkedinUrl || '';
    
  const tiktokUrl = configData.tiktokUrl !== undefined 
    ? configData.tiktokUrl 
    : config?.tiktokUrl || '';
    
  // Debug para rodapé
  console.log("GeneralSettings - Estado das cores:", {
    footerTextColor,
    footerIconsColor,
    configDataFooterTextColor: configData.footerTextColor,
    configDataFooterIconsColor: configData.footerIconsColor,
    configFooterTextColor: config?.footerTextColor,
    configFooterIconsColor: config?.footerIconsColor
  });
  
  // Garantindo que as cores nunca sejam null ou undefined
  const safeFooterTextColor = footerTextColor || '#ffffff';
  const safeFooterIconsColor = footerIconsColor || primaryColor || '#1f4dbe';
    
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

  const handleHeadingFontChange = (newValue: string) => {
    onConfigChange({ headingFont: newValue });
  };

  const handleBodyFontChange = (newValue: string) => {
    onConfigChange({ bodyFont: newValue });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </Label>
          <div className="flex items-start">
            <ImageUpload
              currentImage={logo}
              onImageChange={handleLogoChange}
              onRemoveImage={removeLogo}
              label="Upload Logo"
            />
          </div>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Logo do Rodapé
          </Label>
          <div className="flex items-start">
            <ImageUpload
              currentImage={configData.footerLogo !== undefined ? configData.footerLogo : config?.footerLogo || ''}
              onImageChange={(value) => onConfigChange({ ...configData, footerLogo: value })}
              onRemoveImage={() => onConfigChange({ ...configData, footerLogo: '' })}
              label="Upload Logo Rodapé"
            />
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Background do Banner
          </Label>
          <div className="flex items-start">
            <ImageUpload
              currentImage={bannerBg}
              onImageChange={handleBannerBgChange}
              onRemoveImage={removeBanner}
              previewClassName="w-32 h-32"
              label="Upload Banner"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Fonte dos Títulos
          </Label>
          <select 
            className="w-full border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            value={headingFont || ""}
            onChange={(e) => handleHeadingFontChange(e.target.value)}
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Poppins">Poppins</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Raleway">Raleway</option>
            <option value="Merriweather">Merriweather</option>
          </select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Fonte dos Textos
          </Label>
          <select 
            className="w-full border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            value={bodyFont || ""}
            onChange={(e) => handleBodyFontChange(e.target.value)}
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Source Sans Pro">Source Sans Pro</option>
            <option value="Nunito">Nunito</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Cor Primária
          </Label>
          <div className="flex">
            <Input 
              type="color" 
              value={primaryColor || '#1f4dbe'} 
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              className="h-10 w-10 border-0 rounded-l-lg p-0"
            />
            <Input 
              type="text" 
              value={primaryColor || '#1f4dbe'} 
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Background Rodapé
          </Label>
          <div className="flex">
            <Input 
              type="color" 
              value={secondaryColor || '#3e63dd'}
              onChange={(e) => handleSecondaryColorChange(e.target.value)}
              className="h-10 w-10 border-0 rounded-l-lg p-0"
            />
            <Input 
              type="text" 
              value={secondaryColor || '#3e63dd'} 
              onChange={(e) => handleSecondaryColorChange(e.target.value)}
              className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Estilo do Rodapé
          </Label>
          <select
            value={configData?.footerStyle || 'default'}
            onChange={(e) => onConfigChange({ ...configData, footerStyle: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
          >
            <option value="default">Completo (3 colunas)</option>
            <option value="minimal">Minimalista</option>
          </select>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Cor do Texto do Rodapé
          </Label>
          <div className="flex">
            <Input 
              type="color" 
              value={safeFooterTextColor}
              onChange={(e) => onConfigChange({ ...configData, footerTextColor: e.target.value })}
              className="h-10 w-10 border-0 rounded-l-lg p-0"
            />
            <Input 
              type="text" 
              value={safeFooterTextColor}
              onChange={(e) => onConfigChange({ ...configData, footerTextColor: e.target.value })}
              className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Cor dos Ícones do Rodapé
          </Label>
          <div className="flex">
            <Input 
              type="color" 
              value={safeFooterIconsColor}
              onChange={(e) => onConfigChange({ ...configData, footerIconsColor: e.target.value })}
              className="h-10 w-10 border-0 rounded-l-lg p-0"
            />
            <Input 
              type="text" 
              value={safeFooterIconsColor}
              onChange={(e) => onConfigChange({ ...configData, footerIconsColor: e.target.value })}
              className="border border-l-0 border-gray-200 rounded-r-full px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Seção de Redes Sociais */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Redes Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram URL
            </Label>
            <div className="flex items-center">
              <div className="bg-pink-500 text-white p-2 rounded-l-lg">
                <i className="fab fa-instagram"></i>
              </div>
              <Input 
                type="text" 
                value={instagramUrl || ''} 
                onChange={(e) => onConfigChange({ ...configData, instagramUrl: e.target.value })}
                className="border border-gray-200 rounded-r-lg flex-grow"
                placeholder="https://instagram.com/seu_perfil"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook URL
            </Label>
            <div className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-l-lg">
                <i className="fab fa-facebook-f"></i>
              </div>
              <Input 
                type="text" 
                value={facebookUrl || ''} 
                onChange={(e) => onConfigChange({ ...configData, facebookUrl: e.target.value })}
                className="border border-gray-200 rounded-r-lg flex-grow"
                placeholder="https://facebook.com/sua_pagina"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL
            </Label>
            <div className="flex items-center">
              <div className="bg-red-600 text-white p-2 rounded-l-lg">
                <i className="fab fa-youtube"></i>
              </div>
              <Input 
                type="text" 
                value={youtubeUrl || ''} 
                onChange={(e) => onConfigChange({ ...configData, youtubeUrl: e.target.value })}
                className="border border-gray-200 rounded-r-lg flex-grow"
                placeholder="https://youtube.com/c/seu_canal"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </Label>
            <div className="flex items-center">
              <div className="bg-blue-700 text-white p-2 rounded-l-lg">
                <i className="fab fa-linkedin-in"></i>
              </div>
              <Input 
                type="text" 
                value={linkedinUrl || ''} 
                onChange={(e) => onConfigChange({ ...configData, linkedinUrl: e.target.value })}
                className="border border-gray-200 rounded-r-lg flex-grow"
                placeholder="https://linkedin.com/company/sua_empresa"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              TikTok URL
            </Label>
            <div className="flex items-center">
              <div className="bg-black text-white p-2 rounded-l-lg">
                <i className="fab fa-tiktok"></i>
              </div>
              <Input 
                type="text" 
                value={tiktokUrl || ''} 
                onChange={(e) => onConfigChange({ ...configData, tiktokUrl: e.target.value })}
                className="border border-gray-200 rounded-r-lg flex-grow"
                placeholder="https://tiktok.com/@seu_perfil"
              />
            </div>
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
          value={footerInfo || ''}
          onChange={(e) => handleFooterInfoChange(e.target.value)}
        />
      </div>
      
      {/* Seção de Tags de Marketing */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Tags de Conversão e Remarketing</h3>
        
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Google Tag Manager
            </Label>
            <Textarea 
              rows={4} 
              className="w-full rounded-xl font-mono text-sm"
              placeholder="<!-- Cole o código do Google Tag Manager (apenas a parte que vai no head) -->"
              value={configData.googleTagManagerTag !== undefined ? configData.googleTagManagerTag : config?.googleTagManagerTag || ''}
              onChange={(e) => onConfigChange({ ...configData, googleTagManagerTag: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">Cole apenas o script principal do Google Tag Manager que vai no &lt;head&gt; do site.</p>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Google Ads - Tag de Conversão
            </Label>
            <Textarea 
              rows={4} 
              className="w-full rounded-xl font-mono text-sm"
              placeholder="<!-- Cole o código fornecido pelo Google Ads para rastreamento de conversão -->"
              value={configData.googleAdsConversionTag !== undefined ? configData.googleAdsConversionTag : config?.googleAdsConversionTag || ''}
              onChange={(e) => onConfigChange({ ...configData, googleAdsConversionTag: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">Cole o snippet de código JavaScript fornecido pelo Google Ads para rastreamento de conversão.</p>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Google Ads - Tag de Remarketing
            </Label>
            <Textarea 
              rows={4} 
              className="w-full rounded-xl font-mono text-sm"
              placeholder="<!-- Cole o código fornecido pelo Google Ads para remarketing -->"
              value={configData.googleAdsRemarketingTag !== undefined ? configData.googleAdsRemarketingTag : config?.googleAdsRemarketingTag || ''}
              onChange={(e) => onConfigChange({ ...configData, googleAdsRemarketingTag: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">Cole o snippet de código JavaScript fornecido pelo Google Ads para remarketing.</p>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Meta (Facebook) Pixel
            </Label>
            <Textarea 
              rows={4} 
              className="w-full rounded-xl font-mono text-sm"
              placeholder="<!-- Cole o código fornecido pelo Facebook para o Pixel -->"
              value={configData.facebookPixelTag !== undefined ? configData.facebookPixelTag : config?.facebookPixelTag || ''}
              onChange={(e) => onConfigChange({ ...configData, facebookPixelTag: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">Cole o snippet de código JavaScript fornecido pelo Meta Ads (Facebook Pixel).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
