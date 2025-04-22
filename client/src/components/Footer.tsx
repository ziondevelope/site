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

  // Rodapé padrão completo com design moderno
  return (
    <footer style={{ 
      backgroundColor: config?.secondaryColor || '#333', 
      color: config?.footerTextColor || '#fff'
    }} className="py-16 relative overflow-hidden">
      {/* Elemento decorativo */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10" style={{ 
        backgroundColor: config?.primaryColor || '#f7f7f7',
        clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)'
      }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Coluna 1: Logo e Informações */}
          <div className="md:col-span-1">
            <div className="flex flex-col">
              {isLoadingConfig ? (
                <div className="h-12 w-32 rounded animate-pulse mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
              ) : config?.footerLogo ? (
                <div className="h-12 min-w-[128px] mb-6">
                  <img 
                    src={config.footerLogo} 
                    alt="Logo da Imobiliária" 
                    className="h-full object-contain"
                    loading="eager" 
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "1";
                    }}
                    style={{ opacity: 0, transition: "opacity 0.3s ease" }}
                  />
                </div>
              ) : config?.logo ? (
                <div className="h-12 min-w-[128px] mb-6">
                  <img 
                    src={config.logo} 
                    alt="Logo da Imobiliária" 
                    className="h-full object-contain"
                    loading="eager" 
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "1";
                    }}
                    style={{ opacity: 0, transition: "opacity 0.3s ease" }}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" 
                    style={{ backgroundColor: config?.primaryColor || 'var(--primary)', color: config?.footerTextColor || '#fff' }}>
                    <i className="ri-home-line text-2xl"></i>
                  </div>
                  <h1 className="text-2xl font-bold" style={{ color: config?.footerTextColor || '#fff' }}>Imobiliária</h1>
                </div>
              )}
              
              <p className="mb-8 max-w-xs leading-relaxed" style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.7)' }}>
                {config?.footerInfo || 'Soluções imobiliárias completas para você encontrar o imóvel dos seus sonhos.'}
              </p>
              
              {/* Social icons */}
              <div className="flex flex-wrap gap-3 mt-auto">
                {config?.facebookUrl && (
                  <a 
                    href={config.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: config?.footerIconsColor || config?.primaryColor || '#4a5568',
                      color: config?.secondaryColor || '#fff' 
                    }}
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                )}
                {config?.linkedinUrl && (
                  <a 
                    href={config.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: config?.footerIconsColor || config?.primaryColor || '#4a5568',
                      color: config?.secondaryColor || '#fff' 
                    }}
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                )}
                {config?.youtubeUrl && (
                  <a 
                    href={config.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: config?.footerIconsColor || config?.primaryColor || '#4a5568',
                      color: config?.secondaryColor || '#fff' 
                    }}
                  >
                    <i className="fab fa-youtube"></i>
                  </a>
                )}
                {config?.instagramUrl && (
                  <a 
                    href={config.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: config?.footerIconsColor || config?.primaryColor || '#4a5568',
                      color: config?.secondaryColor || '#fff' 
                    }}
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                )}
                {config?.tiktokUrl && (
                  <a 
                    href={config.tiktokUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: config?.footerIconsColor || config?.primaryColor || '#4a5568',
                      color: config?.secondaryColor || '#fff' 
                    }}
                  >
                    <i className="fab fa-tiktok"></i>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Coluna 2: Links Rápidos */}
          <div className="md:col-span-1">
            <h3 
              className="text-lg font-semibold mb-6 pb-2 border-b border-opacity-20" 
              style={{ 
                color: config?.footerTextColor || '#fff',
                borderColor: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.2)' 
              }}
            >
              Links Rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="hover:opacity-100 transition-opacity flex items-center opacity-90"
                  style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}
                >
                  <i 
                    className="fas fa-chevron-right mr-2 text-xs" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/properties?purpose=sale" 
                  className="hover:opacity-100 transition-opacity flex items-center opacity-90"
                  style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}
                >
                  <i 
                    className="fas fa-chevron-right mr-2 text-xs" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                  <span>Imóveis à Venda</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/properties?purpose=rent" 
                  className="hover:opacity-100 transition-opacity flex items-center opacity-90"
                  style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}
                >
                  <i 
                    className="fas fa-chevron-right mr-2 text-xs" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                  <span>Imóveis para Alugar</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="hover:opacity-100 transition-opacity flex items-center opacity-90"
                  style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}
                >
                  <i 
                    className="fas fa-chevron-right mr-2 text-xs" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                  <span>Sobre Nós</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="hover:opacity-100 transition-opacity flex items-center opacity-90"
                  style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}
                >
                  <i 
                    className="fas fa-chevron-right mr-2 text-xs" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                  <span>Contato</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Coluna 3: Fale Conosco */}
          <div className="md:col-span-1">
            <h3 
              className="text-lg font-semibold mb-6 pb-2 border-b border-opacity-20" 
              style={{ 
                color: config?.footerTextColor || '#fff',
                borderColor: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.2)' 
              }}
            >
              Fale Conosco
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" 
                     style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <i 
                    className="fab fa-whatsapp text-lg" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                </div>
                <a 
                  href={`https://wa.me/${config?.phone?.replace(/\D/g, '')}`} 
                  className="group-hover:opacity-100 transition-opacity opacity-90"
                  style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}
                >
                  {config?.phone || '(11) 4063-4100'}
                </a>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" 
                     style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <i 
                    className="far fa-envelope text-lg" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                </div>
                <a 
                  href={`mailto:${config?.email}`} 
                  className="group-hover:opacity-100 transition-opacity opacity-90"
                  style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}
                >
                  {config?.email || 'suporte@imobzi.com'}
                </a>
              </div>
            </div>
          </div>
          
          {/* Coluna 4: Localização */}
          <div className="md:col-span-1">
            <h3 
              className="text-lg font-semibold mb-6 pb-2 border-b border-opacity-20" 
              style={{ 
                color: config?.footerTextColor || '#fff',
                borderColor: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.2)' 
              }}
            >
              Localização
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" 
                     style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <i 
                    className="ri-map-pin-line text-lg" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                </div>
                <span style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}>{config?.address || 'Av. Paulista, 1000 - São Paulo, SP'}</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" 
                     style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <i 
                    className="ri-time-line text-lg" 
                    style={{ color: config?.footerIconsColor || config?.primaryColor || 'rgba(255,255,255,0.9)' }}
                  ></i>
                </div>
                <span style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.9)' }}>{config?.workingHours || 'Segunda a Sexta, 09:00 às 18:00'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Linha divisória e créditos */}
        <div className="border-t mt-12 pt-6" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm opacity-80" style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.7)' }}>
                &copy; {new Date().getFullYear()} {config?.companyName || 'Imobiliária'}. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex items-center">
              <Link 
                href="/admin" 
                className="text-sm mr-6 hover:opacity-100 transition-opacity opacity-80"
                style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.7)' }}
              >
                Área do Administrador
              </Link>
              <div className="flex items-center">
                <span 
                  className="text-sm mr-2 opacity-80" 
                  style={{ color: config?.footerTextColor || 'rgba(255,255,255,0.7)' }}
                >
                  Tecnologia
                </span>
                <img src={imobsiteLogo} alt="Imobsite" className="h-7 opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}