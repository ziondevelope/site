import { Link } from "wouter";
import { WebsiteConfig } from "@shared/schema";
import imobsiteLogo from '../assets/imobsite-logo.png';

interface FooterProps {
  config?: WebsiteConfig;
  isLoadingConfig?: boolean;
}

export default function Footer({ config, isLoadingConfig }: FooterProps) {
  // Se o estilo de rodapé for "minimal", use o rodapé simples
  if (config?.footerStyle === "minimal") {
    return (
      <footer style={{ 
        backgroundColor: config?.secondaryColor || '#333', 
        color: config?.footerTextColor || '#fff' 
      }} className="py-6 text-center">
        <div className="container mx-auto px-4">
          {/* Logo ou nome da imobiliária */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            {config?.footerLogo ? (
              <div className="h-10 max-w-[160px]">
                <img 
                  src={config.footerLogo} 
                  alt="Logo da Imobiliária" 
                  className="h-full object-contain"
                  loading="lazy"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            ) : config?.logo ? (
              <div className="h-10 max-w-[160px]">
                <img 
                  src={config.logo} 
                  alt="Logo da Imobiliária" 
                  className="h-full object-contain"
                  loading="lazy"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            ) : (
              <>
                <div className="h-8 w-8 rounded flex items-center justify-center text-white" 
                  style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}>
                  <i className="ri-home-line text-lg"></i>
                </div>
                <h1 className="text-xl font-bold">Imobiliária</h1>
              </>
            )}
          </div>
          
          {/* Redes sociais */}
          <div className="flex justify-center space-x-4 mb-6">
            {config?.facebookUrl && (
              <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <i className="fab fa-facebook-f" style={{ color: config?.secondaryColor || '#333' }}></i>
              </a>
            )}
            {config?.instagramUrl && (
              <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <i className="fab fa-instagram" style={{ color: config?.secondaryColor || '#333' }}></i>
              </a>
            )}
            {config?.linkedinUrl && (
              <a href={config.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <i className="fab fa-linkedin-in" style={{ color: config?.secondaryColor || '#333' }}></i>
              </a>
            )}
            {config?.youtubeUrl && (
              <a href={config.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <i className="fab fa-youtube" style={{ color: config?.secondaryColor || '#333' }}></i>
              </a>
            )}
            {config?.tiktokUrl && (
              <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <i className="fab fa-tiktok" style={{ color: config?.secondaryColor || '#333' }}></i>
              </a>
            )}
          </div>
          
          <p style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.7)' }}>
            &copy; {new Date().getFullYear()} - Todos os direitos reservados
          </p>
        </div>
      </footer>
    );
  }

  // Rodapé padrão completo com 3 colunas
  return (
    <footer style={{ 
      backgroundColor: config?.secondaryColor || '#333', 
      color: config?.footerTextColor || '#fff' 
    }} className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              {isLoadingConfig ? (
                // Placeholder durante o carregamento - mantém o mesmo tamanho
                <div className="h-10 w-24 rounded animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
              ) : config?.footerLogo ? (
                <div className="h-10 min-w-[96px]">
                  <img 
                    src={config.footerLogo} 
                    alt="Logo da Imobiliária" 
                    className="h-full object-contain"
                    loading="eager" 
                    onLoad={(e) => {
                      // Torna a imagem visível quando carregada
                      (e.target as HTMLImageElement).style.opacity = "1";
                    }}
                    style={{ opacity: 0, transition: "opacity 0.2s ease" }}
                  />
                </div>
              ) : config?.logo ? (
                <div className="h-10 min-w-[96px]">
                  <img 
                    src={config.logo} 
                    alt="Logo da Imobiliária" 
                    className="h-full object-contain"
                    loading="eager" 
                    onLoad={(e) => {
                      // Torna a imagem visível quando carregada
                      (e.target as HTMLImageElement).style.opacity = "1";
                    }}
                    style={{ opacity: 0, transition: "opacity 0.2s ease" }}
                  />
                </div>
              ) : (
                <>
                  <div className="h-10 w-10 rounded flex items-center justify-center text-white" 
                    style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}>
                    <i className="ri-home-line text-xl"></i>
                  </div>
                  <h1 className="text-2xl font-bold">Imobiliária</h1>
                </>
              )}
            </div>
            <p style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.7)' }} className="mb-6">
              {config?.footerInfo || 'Soluções imobiliárias completas para você encontrar o imóvel dos seus sonhos.'}
            </p>

          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Fale Conosco</h3>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <i className="fab fa-whatsapp text-xl mr-3" style={{ color: config?.footerIconsColor || config?.primaryColor || 'var(--primary)' }}></i>
                <span style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}>{config?.phone || '(11) 4063-4100'}</span>
              </div>
              <div className="flex items-center">
                <i className="far fa-envelope text-xl mr-3" style={{ color: config?.footerIconsColor || config?.primaryColor || 'var(--primary)' }}></i>
                <span style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}>{config?.email || 'suporte@imobzi.com'}</span>
              </div>
              <div className="flex space-x-3 mt-2">
                {config?.facebookUrl && (
                  <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                    <i className="fab fa-facebook-f" style={{ color: config?.secondaryColor || '#333' }}></i>
                  </a>
                )}
                {config?.linkedinUrl && (
                  <a href={config.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                    <i className="fab fa-linkedin-in" style={{ color: config?.secondaryColor || '#333' }}></i>
                  </a>
                )}
                {config?.youtubeUrl && (
                  <a href={config.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                    <i className="fab fa-youtube" style={{ color: config?.secondaryColor || '#333' }}></i>
                  </a>
                )}
                {config?.instagramUrl && (
                  <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                    <i className="fab fa-instagram" style={{ color: config?.secondaryColor || '#333' }}></i>
                  </a>
                )}
                {config?.tiktokUrl && (
                  <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                    <i className="fab fa-tiktok" style={{ color: config?.secondaryColor || '#333' }}></i>
                  </a>
                )}
              </div>
            </div>
          </div>
          

          <div>
            <h3 className="text-lg font-semibold mb-6">Localização</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <i 
                  className="ri-map-pin-line text-xl mr-3"
                  style={{ color: config?.footerIconsColor || config?.primaryColor || 'var(--primary)' }}
                ></i>
                <span style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}>{config?.address || 'Av. Paulista, 1000 - São Paulo, SP'}</span>
              </div>
              <div className="flex items-center">
                <i 
                  className="ri-time-line text-xl mr-3"
                  style={{ color: config?.footerIconsColor || config?.primaryColor || 'var(--primary)' }}
                ></i>
                <span style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}>{config?.workingHours || 'Segunda a Sexta, 09:00 às 18:00'}</span>
              </div>

            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.2)', color: config?.footerTextColor || 'rgba(255,255,255,0.7)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-center md:justify-start items-center">
              <Link href="/admin">
                <span className="text-sm hover:text-white cursor-pointer">Área do Administrador</span>
              </Link>
            </div>
            <div className="flex justify-center md:justify-end items-center">
              <span className="mr-2 text-sm text-white">Tecnologia</span>
              <img src={imobsiteLogo} alt="Imobsite" className="h-7" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}