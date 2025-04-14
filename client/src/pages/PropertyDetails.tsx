import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { Property } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function PropertyDetails() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  // Estado e referências para o carrossel
  const [carouselPage, setCarouselPage] = useState(0);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const totalPages = 3; // Número total de páginas no carrossel
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id
  });
  
  // Fetch all properties (for similar properties)
  const { data: allProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties']
  });
  
  // Atualiza propriedades similares quando property ou allProperties mudarem
  useEffect(() => {
    if (property && allProperties) {
      // Filtra propriedades similares (mesma cidade ou tipo)
      const similar = allProperties.filter((p: Property) => 
        p.id !== property.id && 
        (p.city === property.city || p.type === property.type)
      ).slice(0, 8);
      
      setSimilarProperties(similar);
    }
  }, [property, allProperties]);

  // Fetch website configuration
  const { data: config } = useQuery<any>({
    queryKey: ['/api/website/config']
  });

  // Set the first image as active when property data is loaded
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

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Get feature icons
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
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Navegação e código */}
              <div className="flex flex-wrap justify-between items-center mb-2">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Link href="/">
                    <span className="cursor-pointer hover:text-gray-700">Home</span>
                  </Link>
                  <i className="ri-arrow-right-s-line mx-1"></i>
                  <Link href="/">
                    <span className="cursor-pointer hover:text-gray-700">Imóveis</span>
                  </Link>
                  <i className="ri-arrow-right-s-line mx-1"></i>
                  <span className="text-gray-700">{currentProperty.title}</span>
                </div>
              </div>
              
              {/* Layout de duas colunas principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna da esquerda - Conteúdo principal */}
                <div className="lg:col-span-2">
                  {/* Imagem Principal */}
                  <div 
                    className="w-full h-[500px] rounded-xl mb-2 overflow-hidden relative bg-cover bg-center"
                    style={{ 
                      backgroundImage: activeImage ? `url(${activeImage})` : 'none',
                    }}
                  >
                    {!activeImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <i className="ri-image-line text-4xl text-gray-400"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Miniaturas */}
                  {currentProperty.images && currentProperty.images.length > 0 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
                      {currentProperty.images.map((image, index) => {
                        // Determinar a URL da imagem dependendo do formato
                        const imageUrl = typeof image === 'object' && image.url 
                          ? image.url 
                          : typeof image === 'string' 
                            ? image 
                            : '';
                            
                        if (!imageUrl) return null;
                            
                        return (
                          <div 
                            key={index}
                            className="w-28 h-20 rounded-md flex-shrink-0 cursor-pointer overflow-hidden"
                            onClick={() => setActiveImage(imageUrl)}
                          >
                            <img 
                              src={imageUrl} 
                              alt={`Imagem ${index + 1} do imóvel`}
                              className={`w-full h-full object-cover transition-all ${
                                activeImage === imageUrl ? 'ring-2 ring-offset-2 ring-primary' : 'filter brightness-75 hover:brightness-100'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
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
                  
                  {/* Esta seção foi removida para ser substituída por uma seção mais abaixo */}
                </div>
                
                {/* Coluna da direita - Formulário de contato */}
                <div>
                  <div className="p-6 border border-gray-200 rounded-lg sticky top-4">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-2">Interessado neste imóvel?</h3>
                      <p className="text-gray-600">
                        Entre em contato com um de nossos corretores
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <button 
                        className="w-full py-3 px-4 rounded-md font-medium text-white flex items-center justify-center"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <i className="ri-whatsapp-line mr-2 text-lg"></i>
                        WhatsApp
                      </button>
                    </div>
                    
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      <div>
                        <input
                          type="text"
                          placeholder="Seu nome"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Seu email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Seu telefone"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Mensagem"
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          defaultValue={`Olá, tenho interesse no imóvel ${currentProperty.title} (Ref: #${currentProperty.id}).`}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 rounded-md font-medium text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Enviar Mensagem
                      </button>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4">
                          <img 
                            src="https://via.placeholder.com/48"
                            alt="Corretor" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Equipe LLImóveis</p>
                          <p className="text-sm text-gray-500">Entre em contato conosco</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      {currentProperty && (
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
              <div className="carousel-container overflow-hidden">
                <div 
                  ref={carouselTrackRef}
                  className="carousel-track flex space-x-4 py-4 overflow-x-auto scrollbar-hide"
                >
                  {similarProperties.length > 0 ? (
                    similarProperties.map((property) => (
                      <div key={property.id} className="carousel-item flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2">
                        <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
                          <div className="h-48 bg-gray-200 relative">
                            {property.images && property.images.length > 0 && (
                              <img 
                                src={typeof property.images[0] === 'object' && property.images[0].url 
                                  ? property.images[0].url 
                                  : typeof property.images[0] === 'string' 
                                    ? property.images[0] 
                                    : ''}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                              {property.purpose === 'rent' ? 'Aluguel' : 'Venda'}
                            </div>
                            {property.isFeatured && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs py-1 px-2 rounded">
                                Destaque
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1 truncate">
                              {property.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-2 truncate">
                              {property.neighborhood || property.city}
                            </p>
                            <div className="flex justify-between items-center mb-3">
                              <div className="font-bold text-lg" style={{ color: primaryColor }}>
                                {formatCurrency(property.price)}
                                {property.purpose === 'rent' && <span className="text-xs font-normal text-gray-500">/mês</span>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-gray-500 text-sm mb-3">
                              {property.bedrooms && <span><i className="ri-hotel-bed-line mr-1"></i> {property.bedrooms}</span>}
                              {property.bathrooms && <span><i className="ri-shower-line mr-1"></i> {property.bathrooms}</span>}
                              {property.parkingSpots && <span><i className="ri-car-line mr-1"></i> {property.parkingSpots}</span>}
                              <span><i className="ri-ruler-line mr-1"></i> {property.area}m²</span>
                            </div>
                            <Link href={`/property/${property.id}`}>
                              <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium flex justify-center items-center">
                                <i className="ri-search-line mr-2"></i> Ver detalhes
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Placeholders quando não há propriedades similares
                    [1, 2, 3, 4].map((item) => (
                      <div key={item} className="carousel-item flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2">
                        <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="h-48 bg-gray-100"></div>
                          <div className="p-4">
                            <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
                            <div className="h-6 bg-gray-100 rounded w-1/3 mb-3"></div>
                            <div className="h-8 bg-gray-100 rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Indicadores de página */}
              <div className="flex justify-center space-x-2 mt-6">
                {[...Array(totalPages)].map((_, index) => (
                  <button 
                    key={index} 
                    className={`h-2 rounded-full transition-all ${index === carouselPage ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'}`}
                    aria-label={`Página ${index + 1}`}
                    onClick={() => {
                      if (!carouselTrackRef.current) return;
                      const containerWidth = carouselTrackRef.current.parentElement?.clientWidth || 0;
                      carouselTrackRef.current.scrollTo({
                        left: containerWidth * index,
                        behavior: 'smooth'
                      });
                      setCarouselPage(index);
                    }}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-10 w-10 rounded text-white flex items-center justify-center" 
                  style={{ backgroundColor: primaryColor }}>
                  <i className="ri-home-4-line text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">Imobiliária</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Encontrando o lar perfeito para você desde 2005.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-facebook-circle-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-instagram-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-youtube-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-whatsapp-fill text-xl"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Início</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Imóveis</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Tipos de Imóveis</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Apartamentos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Casas</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terrenos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Comerciais</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Rurais</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="ri-map-pin-line mt-1 mr-2" style={{ color: primaryColor }}></i>
                  <span>Av. Paulista, 1000<br/>São Paulo, SP, Brasil</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-phone-line mr-2" style={{ color: primaryColor }}></i>
                  <span>(11) 3333-4444</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-mail-line mr-2" style={{ color: primaryColor }}></i>
                  <span>contato@imobiliaria.com.br</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-time-line mr-2" style={{ color: primaryColor }}></i>
                  <span>Seg-Sex: 9h às 18h</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">&copy; 2025 Imobiliária. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}