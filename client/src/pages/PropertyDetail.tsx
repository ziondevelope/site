import { useEffect, useState, useRef } from 'react';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Property, User, WebsiteConfig } from '@shared/schema';

import { Button } from '@/components/ui/button';

export default function PropertyDetail() {
  // Usando useRoute para capturar o parâmetro de ID da URL
  const [match, params] = useRoute<{ id: string }>('/properties/:id');
  const id = match ? parseInt(params.id, 10) : NaN;

  // Queries para a propriedade, agente e configuração
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: ['/api/properties', id],
    enabled: !isNaN(id),
  });

  const { data: agent } = useQuery<User>({
    queryKey: ['/api/agents', property?.agentId],
    enabled: !!property?.agentId,
  });

  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
  });

  // Estado para a imagem atual
  const [activeImage, setActiveImage] = useState<string | undefined>();

  // Estado para controlar o carrossel de imóveis similares
  const [carouselPage, setCarouselPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  
  // Calcular o número total de páginas do carrossel quando os dados são carregados
  useEffect(() => {
    if (allProperties && allProperties.length > 0 && currentProperty) {
      // Filtramos imóveis similares (mesmo propósito e diferente ID)
      const similarProperties = allProperties.filter(
        p => p.id !== currentProperty.id && p.purpose === currentProperty.purpose
      );
      
      // Limitar a 8 propriedades no carrossel
      const propertiesToShow = similarProperties.slice(0, 8);
      
      // 3 propriedades por página no desktop, 1 em mobile
      // Calculamos com base no número máximo (desktop)
      const itemsPerPage = 3;
      const calculatedPages = Math.ceil(propertiesToShow.length / itemsPerPage);
      
      setTotalPages(calculatedPages > 0 ? calculatedPages : 1);
    }
  }, [allProperties, currentProperty]);

  // Propriedades similares
  const { data: allProperties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: true, // Sempre buscar as propriedades
  });

  // Define a imagem ativa inicialmente
  useEffect(() => {
    if (property?.images && property.images.length > 0) {
      // Verificar se a propriedade tem imagens e se são objetos com url
      if (typeof property.images[0] === 'object' && property.images[0].url) {
        const featuredImage = property.images.find(img => 
          typeof img === 'object' && 'isFeatured' in img && img.isFeatured
        );
        
        setActiveImage(
          featuredImage && 'url' in featuredImage 
            ? featuredImage.url 
            : property.images[0].url
        );
      } 
      // Se for array de strings
      else if (typeof property.images[0] === 'string') {
        setActiveImage(property.images[0]);
      }
    } else if (property?.featuredImage) {
      // Compatibilidade com versões antigas
      setActiveImage(property.featuredImage);
    }
  }, [property]);
  
  // Formatação de moeda
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Ícones para características do imóvel
  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, string> = {
      'Piscina': 'ri-water-flash-line',
      'Academia': 'ri-boxing-line',
      'Churrasqueira': 'ri-fire-line',
      'Pet friendly': 'ri-dog-line',
      'Segurança 24h': 'ri-shield-check-line',
      'Playground': 'ri-gamepad-line',
      'Estacionamento': 'ri-parking-line',
      'Elevador': 'ri-arrow-up-down-line',
      'Wi-Fi': 'ri-wifi-line',
      'Área de lazer': 'ri-landscape-line',
      'Ar condicionado': 'ri-temp-cold-line',
      'Quadra': 'ri-basketball-line',
      'Salão de festas': 'ri-party-line',
      'Varanda': 'ri-home-8-line',
      'Área gourmet': 'ri-restaurant-line',
    };
    
    return icons[feature] || 'ri-checkbox-circle-line';
  };

  // Propriedade atual visual
  const currentProperty = property;
  const primaryColor = config?.primaryColor || 'var(--primary)';

  // Estado para controlar o carregamento do logo
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  // Função para navegar no carrossel
  const navigateCarousel = (direction: 'prev' | 'next') => {
    if (!carouselTrackRef.current) return;
    
    const newPage = direction === 'next' 
      ? Math.min(carouselPage + 1, totalPages - 1)
      : Math.max(carouselPage - 1, 0);
    
    setCarouselPage(newPage);
    
    // Calcular o deslocamento para a página
    const containerWidth = carouselTrackRef.current.parentElement?.clientWidth || 0;
    const scrollAmount = containerWidth * newPage;
    
    carouselTrackRef.current.scrollTo({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };
  
  // Evento de escuta para detectar mudanças no scroll
  useEffect(() => {
    const trackElement = carouselTrackRef.current;
    if (trackElement) {
      const handleCarouselScroll = () => {
        const containerWidth = trackElement.parentElement?.clientWidth || 0;
        if (containerWidth === 0) return;
        
        const scrollPosition = trackElement.scrollLeft;
        const newPage = Math.round(scrollPosition / containerWidth);
        
        if (newPage !== carouselPage) {
          setCarouselPage(newPage);
        }
      };
      
      trackElement.addEventListener('scroll', handleCarouselScroll);
      return () => trackElement.removeEventListener('scroll', handleCarouselScroll);
    }
  }, [carouselPage]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - Mesmo da página principal */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {isLoadingProperty ? (
              // Placeholder durante o carregamento - mantém o mesmo tamanho
              <div className="h-12 w-28 bg-gray-100 rounded animate-pulse"></div>
            ) : config?.logo ? (
              <div className="h-12 min-w-[112px]">
                <img 
                  src={config.logo} 
                  alt="Logo da Imobiliária" 
                  className="h-full object-contain"
                  loading="eager" 
                  onLoad={(e) => {
                    // Torna a imagem visível quando carregada
                    (e.target as HTMLImageElement).style.opacity = "1";
                    setLogoLoaded(true);
                  }}
                  style={{ opacity: 0, transition: "opacity 0.2s ease" }}
                />
              </div>
            ) : (
              <>
                <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white">
                  <i className="ri-home-line text-xl"></i>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Imobiliária</h1>
              </>
            )}
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className="text-gray-700 hover:text-primary cursor-pointer">Início</span>
            </Link>
            <Link href="/#properties">
              <span className="text-gray-700 hover:text-primary cursor-pointer">Imóveis</span>
            </Link>
            <Link href="/#about">
              <span className="text-gray-700 hover:text-primary cursor-pointer">Sobre</span>
            </Link>
            <Link href="/#contact">
              <span className="text-gray-700 hover:text-primary cursor-pointer">Contato</span>
            </Link>
          </nav>
          <div>
            <Link href="/admin">
              <Button variant="outline" className="ml-4">
                Área do Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-grow bg-white">
        {isLoadingProperty ? (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
                
                <div className="h-[500px] bg-gray-200 rounded-xl mb-6"></div>
                
                <div className="flex space-x-2 mb-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-24 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded mb-8"></div>
                    
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-10 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="h-[400px] bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : currentProperty ? (
          <>
            {/* Slideshow em tela cheia no topo */}
            {currentProperty.images && currentProperty.images.length > 0 && (
              <div className="relative w-full h-[500px] bg-black mb-8 group">
                {/* Slideshow */}
                <div 
                  className="w-full h-full bg-cover bg-center transition-all duration-700"
                  style={{
                    backgroundImage: activeImage ? `url(${activeImage})` : 'none',
                  }}
                >
                  {/* Gradiente escuro no topo e embaixo para melhorar legibilidade */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/50 pointer-events-none"></div>
                  
                  {/* Título do imóvel na parte superior */}
                  <div className="container mx-auto px-4 py-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                      <div className="flex flex-col text-white mt-4">
                        <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wider drop-shadow-lg mb-3">
                          {currentProperty.title}
                        </h1>
                        <div className="flex items-center text-white/90 text-lg">
                          <i className="ri-map-pin-line mr-2"></i>
                          <span className="drop-shadow-md">
                            {currentProperty.address}, {currentProperty.neighborhood} - {currentProperty.city}
                          </span>
                        </div>
                      </div>
                      
                      {/* Navegação básica */}
                      <div className="mt-auto md:mt-2">
                        <div className="flex items-center text-sm text-white/80 mb-2">
                          <Link href="/">
                            <span className="cursor-pointer hover:text-white">Home</span>
                          </Link>
                          <i className="ri-arrow-right-s-line mx-1"></i>
                          <Link href="/">
                            <span className="cursor-pointer hover:text-white">Imóveis</span>
                          </Link>
                          <i className="ri-arrow-right-s-line mx-1"></i>
                          <span className="text-white">Detalhe</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contador de fotos */}
                  <div className="absolute bottom-6 left-6 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-20">
                    <i className="ri-camera-line mr-1"></i>
                    <span>{currentProperty.images.length} fotos</span>
                  </div>
                  
                  {/* Código do imóvel */}
                  <div className="absolute bottom-6 right-6 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium z-20">
                    Cód. LL{currentProperty.id}
                  </div>
                  
                  {/* Navegação do slideshow */}
                  {currentProperty.images.length > 1 && (
                    <>
                      <button 
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/70 hover:bg-white/90 shadow-md flex items-center justify-center transition-all opacity-40 md:opacity-0 group-hover:opacity-100 z-20"
                        onClick={() => {
                          if (currentProperty.images && activeImage) {
                            const index = currentProperty.images.findIndex(img => {
                              if (typeof img === 'object' && img.url) return img.url === activeImage;
                              if (typeof img === 'string') return img === activeImage;
                              return false;
                            });
                            if (index > 0) {
                              const prevImg = currentProperty.images[index - 1];
                              const prevUrl = typeof prevImg === 'object' && prevImg.url 
                                ? prevImg.url 
                                : typeof prevImg === 'string' 
                                  ? prevImg 
                                  : '';
                              if (prevUrl) setActiveImage(prevUrl);
                            }
                          }
                        }}
                      >
                        <i className="ri-arrow-left-s-line text-3xl text-gray-800"></i>
                      </button>
                      <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/70 hover:bg-white/90 shadow-md flex items-center justify-center transition-all opacity-40 md:opacity-0 group-hover:opacity-100 z-20"
                        onClick={() => {
                          if (currentProperty.images && activeImage) {
                            const index = currentProperty.images.findIndex(img => {
                              if (typeof img === 'object' && img.url) return img.url === activeImage;
                              if (typeof img === 'string') return img === activeImage;
                              return false;
                            });
                            if (index < currentProperty.images.length - 1) {
                              const nextImg = currentProperty.images[index + 1];
                              const nextUrl = typeof nextImg === 'object' && nextImg.url 
                                ? nextImg.url 
                                : typeof nextImg === 'string' 
                                  ? nextImg 
                                  : '';
                              if (nextUrl) setActiveImage(nextUrl);
                            }
                          }
                        }}
                      >
                        <i className="ri-arrow-right-s-line text-3xl text-gray-800"></i>
                      </button>
                    </>
                  )}
                </div>
                
                {/* Indicadores de slide na parte inferior */}
                {currentProperty.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                    <div className="flex space-x-2">
                      {currentProperty.images.map((image, index) => {
                        // Determinar a URL da imagem dependendo do formato
                        const imageUrl = typeof image === 'object' && image.url 
                          ? image.url 
                          : typeof image === 'string' 
                            ? image 
                            : '';
                        
                        if (!imageUrl) return null;
                        
                        return (
                          <button 
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              activeImage === imageUrl 
                                ? 'bg-white w-4' 
                                : 'bg-white/40 hover:bg-white/70'
                            }`}
                            onClick={() => setActiveImage(imageUrl)}
                            aria-label={`Imagem ${index + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="container mx-auto px-4 pb-8">
              <div className="max-w-6xl mx-auto">
                {/* Layout de duas colunas principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Coluna da esquerda - Conteúdo principal */}
                  <div className="lg:col-span-2">
                    {/* Informações do imóvel */}
                  
                    {/* Título e preço no estilo da nova referência */}
                    <div className="mb-6">
                      <div className="flex flex-wrap items-center justify-between mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mr-4 flex items-center">
                          {currentProperty.title}
                          <button className="ml-3 text-gray-500 hover:text-gray-700">
                            <i className="ri-share-line text-xl"></i>
                          </button>
                        </h1>
                        <div 
                          className="text-2xl md:text-3xl font-bold mt-3 lg:mt-0"
                          style={{ color: primaryColor }}
                        >
                          {formatCurrency(currentProperty.price)}
                          {currentProperty.purpose === 'rent' && 
                            <span className="text-base font-normal text-gray-500">/mês</span>
                          }
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-4 text-gray-600">
                        <i className="ri-map-pin-line mr-2"></i>
                        <span>{currentProperty.address}</span>
                        <div className="ml-auto text-sm text-gray-600 flex items-center">
                          <i className="ri-code-line mr-1"></i>
                          <span>Cód. LL{currentProperty.id}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-b border-gray-200 py-4 my-4">
                        <div className="grid grid-cols-5 gap-4">
                          <div className="flex items-center">
                            <i className="ri-hotel-bed-line text-xl mr-2" style={{ color: primaryColor }}></i>
                            <div>
                              <span className="font-medium">{currentProperty.bedrooms || 0}</span>
                              <span className="text-gray-500 text-sm ml-1">Quartos</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <i className="ri-shower-line text-xl mr-2" style={{ color: primaryColor }}></i>
                            <div>
                              <span className="font-medium">{currentProperty.bathrooms || 0}</span>
                              <span className="text-gray-500 text-sm ml-1">Banheiros</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <i className="ri-shut-down-line text-xl mr-2" style={{ color: primaryColor }}></i>
                            <div>
                              <span className="font-medium">{currentProperty.suites || 0}</span>
                              <span className="text-gray-500 text-sm ml-1">Suítes</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <i className="ri-car-line text-xl mr-2" style={{ color: primaryColor }}></i>
                            <div>
                              <span className="font-medium">{currentProperty.parkingSpots || 0}</span>
                              <span className="text-gray-500 text-sm ml-1">Vagas</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <i className="ri-ruler-line text-xl mr-2" style={{ color: primaryColor }}></i>
                            <div>
                              <span className="font-medium">{currentProperty.area}</span>
                              <span className="text-gray-500 text-sm ml-1">m²</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Descrição */}
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Descrição</h2>
                      <p className="text-gray-600 whitespace-pre-line">{currentProperty.description}</p>
                    </div>
                    
                    {/* Características */}
                    {currentProperty.features && currentProperty.features.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Características</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                          {currentProperty.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                style={{ backgroundColor: `${primaryColor}15` }}>
                                <i 
                                  className={`${getFeatureIcon(feature)} text-lg`}
                                  style={{ color: primaryColor }}
                                ></i>
                              </div>
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Localização */}
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Localização</h2>
                      <div className="border border-gray-200 rounded-lg h-64 overflow-hidden">
                        {currentProperty.address ? (
                          <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            style={{ border: 0 }} 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(
                              `${currentProperty.address}, ${currentProperty.neighborhood || ''}, ${currentProperty.city || ''}, ${currentProperty.zipCode || ''}`
                            )}&z=15&output=embed`}
                            allowFullScreen
                            title="Localização do imóvel"
                          ></iframe>
                        ) : (
                          <div className="h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <i className="ri-map-pin-line text-4xl mb-2 text-gray-400"></i>
                              <p className="text-gray-500">Mapa indisponível</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Coluna da direita - Cartão de contato no novo estilo */}
                  <div>
                    <div className="rounded-lg sticky top-4 overflow-hidden">
                      {/* Container principal para o box do corretor */}
                      <div className="bg-white p-5">
                        {/* Box único com dois grids */}
                        <div className="w-full rounded-lg overflow-hidden mb-3">
                          {/* Grid 1: Foto do corretor e botões principais (caixa cinza) */}
                          <div className="bg-gray-100 p-4">
                            {/* Foto do corretor */}
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow mx-auto mb-2">
                              {agent?.avatar ? (
                                <img 
                                  src={agent.avatar}
                                  alt={agent.displayName || "Corretor"} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-500">
                                  <i className="ri-user-3-line text-2xl"></i>
                                </div>
                              )}
                            </div>
                            
                            {/* Informações do corretor */}
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold text-gray-800">
                                {agent?.displayName || "Corretor"}
                              </h3>
                              <p className="text-gray-500">
                                {agent?.role === 'agent' ? 'CRECI 111111' : 'Consultor Imobiliário'}
                              </p>
                            </div>
                            
                            {/* Botões principais */}
                            <a 
                              href={agent?.phone ? `https://wa.me/55${agent.phone.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel ${currentProperty.title} (Ref: #${currentProperty.id}).` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 px-4 rounded-full border border-solid text-teal-500 font-medium flex items-center justify-center mb-3 hover:bg-teal-50 transition-colors"
                              style={{ borderColor: primaryColor, color: primaryColor }}
                            >
                              FALE COM O CORRETOR
                            </a>
                            
                            <button 
                              className="w-full py-3 px-4 rounded-full border border-solid font-medium flex items-center justify-center mb-0 hover:bg-teal-50 transition-colors"
                              style={{ borderColor: primaryColor, color: primaryColor }}
                              onClick={() => {
                                // Função para agendar visita - poderia abrir um modal
                                window.alert('Funcionalidade de agendamento em desenvolvimento')
                              }}
                            >
                              AGENDAR UMA VISITA
                            </button>
                          </div>
                          
                          {/* Grid 2: Botão contato e ícones de compartilhamento (fundo colorido) */}
                          <div 
                            className="p-4 text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {/* Botão de Contato */}
                            <a 
                              href={agent?.phone ? `https://wa.me/55${agent?.phone.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel ${currentProperty?.title} (Ref: #${currentProperty?.id}).` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 px-4 rounded-full border border-solid border-white text-white font-medium flex items-center justify-center mb-3 hover:bg-teal-600 transition-colors"
                            >
                              ENTRAR EM CONTATO
                            </a>
                          
                            {/* Botões de compartilhamento */}
                            <p className="text-center text-white text-sm mb-3">
                              COMPARTILHAR
                            </p>
                            <div className="flex justify-center space-x-3">
                              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-500 hover:bg-gray-100 transition-colors">
                                <i className="ri-whatsapp-line"></i>
                              </a>
                              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-500 hover:bg-gray-100 transition-colors">
                                <i className="ri-facebook-fill"></i>
                              </a>
                              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-500 hover:bg-gray-100 transition-colors">
                                <i className="ri-twitter-x-fill"></i>
                              </a>
                              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-500 hover:bg-gray-100 transition-colors">
                                <i className="ri-mail-line"></i>
                              </a>
                              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-500 hover:bg-gray-100 transition-colors">
                                <i className="ri-printer-line"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-lg mx-auto text-center">
              <div className="mb-6 w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                <i className="ri-error-warning-line text-3xl text-red-500"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Imóvel não encontrado</h2>
              <p className="text-gray-600 mb-8">
                O imóvel que você está procurando não está disponível ou foi removido.
              </p>
              <Link href="/">
                <Button size="lg">
                  <i className="ri-home-4-line mr-2"></i>
                  Voltar para a página inicial
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      
      {/* Seção de imóveis similares - Carrossel */}
      {currentProperty && allProperties && allProperties.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Imóveis similares</h2>
              <p className="text-gray-600">Confira outras opções que podem te interessar</p>
            </div>
            
            <div className="relative mb-10">
              {/* Controles do carrossel */}
              <button 
                className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-colors hidden md:block ${carouselPage === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`} 
                aria-label="Anterior"
                onClick={() => navigateCarousel('prev')}
                disabled={carouselPage === 0}
              >
                <i className="ri-arrow-left-s-line text-2xl text-gray-600"></i>
              </button>
              
              <button 
                className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-colors hidden md:block ${carouselPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`} 
                aria-label="Próximo"
                onClick={() => navigateCarousel('next')}
                disabled={carouselPage === totalPages - 1}
              >
                <i className="ri-arrow-right-s-line text-2xl text-gray-600"></i>
              </button>
              
              {/* Carrossel */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out gap-6"
                  ref={carouselTrackRef}
                >
                  {allProperties
                    .filter(p => p.id !== currentProperty?.id && p.purpose === currentProperty?.purpose)
                    .slice(0, 8)
                    .map((property) => (
                      <Link key={property.id} href={`/properties/${property.id}`}>
                        <div className="min-w-[300px] max-w-[300px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col">
                          {/* Imagem */}
                          <div className="h-48 relative">
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={
                                  typeof property.images[0] === 'object' && 'url' in property.images[0] && property.images[0].url
                                    ? property.images[0].url
                                    : typeof property.images[0] === 'string'
                                      ? property.images[0]
                                      : ''
                                }
                                alt={property.title || 'Imóvel'}
                                className="w-full h-full object-cover"
                              />
                            ) : property.featuredImage ? (
                              <img src={property.featuredImage} alt={property.title || 'Imóvel'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <i className="ri-image-line text-4xl text-gray-400"></i>
                              </div>
                            )}
                            
                            {/* Badge (Aluguel/Venda) */}
                            <div className="absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full"
                              style={{ backgroundColor: primaryColor, color: 'white' }}
                            >
                              {property.purpose === 'rent' ? 'Aluguel' : 'Venda'}
                            </div>
                          </div>
                          
                          {/* Conteúdo */}
                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                                {property.title || 'Propriedade sem título'}
                              </h3>
                              <p className="text-gray-500 text-sm mb-2 line-clamp-1">
                                {property.neighborhood || property.city || 'Localização não informada'}
                              </p>
                            </div>
                            
                            <div>
                              <p className="font-bold text-lg mb-2" style={{ color: primaryColor }}>
                                {formatCurrency(property.price)}
                                {property.purpose === 'rent' && <span className="text-xs font-normal text-gray-500">/mês</span>}
                              </p>
                              
                              <div className="flex gap-3 text-gray-500 text-sm">
                                {property.bedrooms ? <span><i className="ri-hotel-bed-line mr-1"></i> {property.bedrooms}</span> : null}
                                {property.bathrooms ? <span><i className="ri-shower-line mr-1"></i> {property.bathrooms}</span> : null}
                                {property.parkingSpots ? <span><i className="ri-car-line mr-1"></i> {property.parkingSpots}</span> : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
              
              {/* Indicadores de página */}
              {allProperties.filter(p => p.id !== currentProperty?.id && p.purpose === currentProperty?.purpose).length > 0 && (
                <div className="flex justify-center space-x-2 mt-6">
                  {allProperties
                    .filter(p => p.id !== currentProperty?.id && p.purpose === currentProperty?.purpose)
                    .slice(0, 8)
                    .map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 rounded-full transition-all ${index === carouselPage ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'}`}
                      aria-label={`Página ${index + 1}`}
                      onClick={() => {
                        if (carouselTrackRef.current) {
                          const containerWidth = carouselTrackRef.current.parentElement?.clientWidth || 0;
                          const scrollAmount = containerWidth * index;
                          
                          carouselTrackRef.current.scrollTo({
                            left: scrollAmount,
                            behavior: 'smooth'
                          });
                          setCarouselPage(index);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo e descrição */}
              <div className="md:col-span-1">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded bg-white flex items-center justify-center text-gray-800 mr-3">
                    <i className="ri-home-line text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold">Imobiliária</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Conectando pessoas a imóveis dos seus sonhos desde 2005.
                </p>
                <div className="flex space-x-3">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <i className="ri-facebook-fill text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <i className="ri-instagram-line text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <i className="ri-whatsapp-line text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <i className="ri-youtube-line text-xl"></i>
                  </a>
                </div>
              </div>
              
              {/* Links rápidos */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Início</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Imóveis em Destaque</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Sobre Nós</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                </ul>
              </div>
              
              {/* Tipos de Imóveis */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Tipos de Imóveis</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Apartamentos</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Casas</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Comercial</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Terrenos</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Imóveis de Luxo</a></li>
                </ul>
              </div>
              
              {/* Contato */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Entre em Contato</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <i className="ri-map-pin-line text-gray-400 mr-3 mt-1"></i>
                    <span className="text-gray-400">Av. Principal, 123, Centro, Rio de Janeiro - RJ</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-phone-line text-gray-400 mr-3"></i>
                    <span className="text-gray-400">(21) 9876-5432</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-mail-line text-gray-400 mr-3"></i>
                    <span className="text-gray-400">contato@imobiliaria.com.br</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-time-line text-gray-400 mr-3"></i>
                    <span className="text-gray-400">Seg-Sex: 9h-18h | Sáb: 9h-13h</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
              <p>&copy; {new Date().getFullYear()} Imobiliária. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}