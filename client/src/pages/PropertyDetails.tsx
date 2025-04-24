import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Header from '@/components/website/Header';
import SEO from '@/components/website/SEO';
import Footer from '@/components/Footer';
import { motion, useAnimation } from 'framer-motion';

export default function PropertyDetails() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  // Estados para controle de rolagem e animação do botão "Falar com corretor"
  const [showContactButton, setShowContactButton] = useState(false);
  const controls = useAnimation();
  
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
  const { data: config, isLoading: isLoadingConfig } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config']
  });
  
  // Buscar dados do agente/corretor
  const { data: agent } = useQuery<any>({
    queryKey: [`/api/agents/${property?.agentId}`],
    enabled: !!property?.agentId,
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
  
  // Cores personalizadas para a página de detalhes
  const detailsBackgroundColor = config?.propertyDetailsBackgroundColor || '#ffffff';
  const detailsTextColor = config?.propertyDetailsTextColor || '#333333';
  const detailsIconsColor = config?.propertyDetailsIconsColor || primaryColor;

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

  // Detectar scroll da página para mostrar/esconder o botão "Falar com corretor"
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = document.documentElement.clientHeight;
      
      // Calcular a porcentagem de rolagem (75% = 0.75)
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage >= 0.75 && !showContactButton) {
        setShowContactButton(true);
        // Animar o botão quando aparecer
        controls.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" }
        });
      } else if (scrollPercentage < 0.75 && showContactButton) {
        // Animar a saída do botão
        controls.start({
          opacity: 0,
          y: 20,
          transition: { duration: 0.3, ease: "easeIn" }
        }).then(() => {
          setShowContactButton(false);
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Verificar inicialmente (caso a página já carregue em uma posição abaixo de 75%)
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showContactButton, controls]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* SEO Component */}
      <SEO 
        title={property ? `${property.title} | ${property.purpose === 'sale' ? 'Venda' : 'Aluguel'}` : config?.seoTitle}
        description={property?.description || config?.seoDescription}
        keywords={config?.seoKeywords}
        favicon={config?.logo}
        ogImage={property?.images && property.images.length > 0 ? 
          (typeof property.images[0] === 'object' ? property.images[0].url : property.images[0]) 
          : config?.bannerBackground
        }
        path={`/properties/${id}`}
      />
      
      {/* Header */}
      <Header config={config} isLoadingConfig={isLoadingConfig} />

      {/* Conteúdo principal */}
      <main className="flex-grow pt-24" style={{ backgroundColor: detailsBackgroundColor }}>
        {/* Botão flutuante de "Falar com Corretor" que aparece após rolar 75% da página */}
        {showContactButton && agent?.phone && (
          <motion.a
            href={`https://wa.me/55${agent.phone.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel ${currentProperty?.title} (Ref: #${currentProperty?.id}).`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 rounded-full bg-[#25D366] text-white font-medium px-5 py-3 shadow-lg flex items-center justify-center hover:bg-[#1fb655] transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="ri-whatsapp-line mr-2 text-xl"></i>
            FALAR COM CORRETOR
          </motion.a>
        )}
        
        {/* Conteúdo condicional baseado no carregamento e existência da propriedade */}
        {isLoadingProperty ? (
          // Esqueleto de carregamento
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
          // Detalhes da propriedade
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto" style={{ color: detailsTextColor }}>
              {/* Navegação */}
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
              
              {/* Conteúdo principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Detalhes do imóvel */}
                  <h1 className="text-3xl font-bold mb-4">{currentProperty.title}</h1>
                  <p className="mb-6">{currentProperty.description}</p>
                  
                  {/* Características principais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {currentProperty.bedrooms && (
                      <div className="flex items-center bg-gray-100 rounded-lg p-3">
                        <i className="ri-hotel-bed-line text-xl mr-3" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <div className="text-sm text-gray-500">Quartos</div>
                          <div className="font-bold">{currentProperty.bedrooms}</div>
                        </div>
                      </div>
                    )}
                    {currentProperty.bathrooms && (
                      <div className="flex items-center bg-gray-100 rounded-lg p-3">
                        <i className="ri-shower-line text-xl mr-3" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <div className="text-sm text-gray-500">Banheiros</div>
                          <div className="font-bold">{currentProperty.bathrooms}</div>
                        </div>
                      </div>
                    )}
                    {currentProperty.area && (
                      <div className="flex items-center bg-gray-100 rounded-lg p-3">
                        <i className="ri-ruler-line text-xl mr-3" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <div className="text-sm text-gray-500">Área</div>
                          <div className="font-bold">{currentProperty.area}m²</div>
                        </div>
                      </div>
                    )}
                    {currentProperty.parkingSpots && (
                      <div className="flex items-center bg-gray-100 rounded-lg p-3">
                        <i className="ri-car-line text-xl mr-3" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <div className="text-sm text-gray-500">Vagas</div>
                          <div className="font-bold">{currentProperty.parkingSpots}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Características e comodidades */}
                  {currentProperty.features && currentProperty.features.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold mb-4">Comodidades</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {currentProperty.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <i className={`${getFeatureIcon(feature)} text-lg mr-2`} style={{ color: detailsIconsColor }}></i>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Mapa */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Localização</h2>
                    <div className="w-full h-[300px] bg-gray-200 rounded-lg">
                      {/* Placeholder para o mapa */}
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <i className="ri-map-pin-line text-4xl mr-2"></i>
                        <span className="text-lg">Mapa indisponível</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão de Falar com corretor e compartilhar abaixo do mapa */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                    {agent?.phone && (
                      <a 
                        href={`https://wa.me/55${agent.phone.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel ${currentProperty?.title} (Ref: #${currentProperty?.id}).`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto bg-[#25D366] text-white font-medium px-6 py-3 rounded-md flex items-center justify-center hover:bg-[#1fb655] transition-colors"
                      >
                        <i className="ri-whatsapp-line mr-2 text-xl"></i>
                        Falar com corretor
                      </a>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const url = window.location.href;
                          navigator.clipboard.writeText(url).then(() => {
                            alert('Link copiado!');
                          });
                        }}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Copiar link"
                      >
                        <i className="ri-link"></i>
                      </button>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 hover:bg-gray-100 transition-colors"
                      >
                        <i className="ri-facebook-fill"></i>
                      </a>
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentProperty.title)}&url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-400 hover:bg-gray-100 transition-colors"
                      >
                        <i className="ri-twitter-fill"></i>
                      </a>
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(currentProperty.title + " " + window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-green-500 hover:bg-gray-100 transition-colors"
                      >
                        <i className="ri-whatsapp-line"></i>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-1">
                  {/* Galeria de imagens */}
                  <div className="mb-6">
                    <div className="rounded-lg overflow-hidden mb-4">
                      {activeImage ? (
                        <img 
                          src={activeImage} 
                          alt={currentProperty.title}
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <i className="ri-image-line text-3xl text-gray-400"></i>
                        </div>
                      )}
                    </div>
                    
                    {currentProperty.images && currentProperty.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {currentProperty.images.slice(0, 4).map((image, index) => {
                          const imageUrl = typeof image === 'object' && image.url 
                            ? image.url 
                            : typeof image === 'string' 
                              ? image 
                              : '';
                          
                          if (!imageUrl) return null;
                          
                          return (
                            <div 
                              key={index}
                              className={`cursor-pointer border-2 rounded overflow-hidden ${activeImage === imageUrl ? 'border-blue-500' : 'border-transparent'}`}
                              onClick={() => setActiveImage(imageUrl)}
                            >
                              <img 
                                src={imageUrl} 
                                alt={`Imagem ${index + 1} do imóvel`}
                                className="w-full h-16 object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Preço */}
                  <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <div className="text-sm text-gray-500 mb-1">
                      {currentProperty.purpose === 'rent' ? 'Aluguel' : 'Venda'}
                    </div>
                    <div className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                      {formatCurrency(currentProperty.price)}
                      {currentProperty.purpose === 'rent' && <span className="text-sm font-normal text-gray-500">/mês</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                      Ref: #{currentProperty.id}
                    </div>
                  </div>
                  
                  {/* Agente/Corretor */}
                  {agent && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                          {agent.profilePicture ? (
                            <img 
                              src={agent.profilePicture} 
                              alt={agent.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                              <i className="ri-user-line text-xl"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{agent.name}</div>
                          <div className="text-sm text-gray-500">Corretor</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {agent.phone && (
                          <a 
                            href={`tel:${agent.phone}`}
                            className="flex items-center text-gray-600 hover:text-gray-800"
                          >
                            <i className="ri-phone-line mr-2"></i>
                            <span>{agent.phone}</span>
                          </a>
                        )}
                        {agent.email && (
                          <a 
                            href={`mailto:${agent.email}`}
                            className="flex items-center text-gray-600 hover:text-gray-800"
                          >
                            <i className="ri-mail-line mr-2"></i>
                            <span>{agent.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Página de "não encontrado"
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
      
      {/* Footer */}
      <Footer />
    </div>
  );
}