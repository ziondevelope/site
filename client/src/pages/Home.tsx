import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WebsiteConfig } from '@shared/schema';
import Header from '@/components/website/Header';
import { Property } from "@shared/schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShower, faBed, faRulerCombined, faCar, faBath } from "@fortawesome/free-solid-svg-icons";
import PropertyDetailsModal from '@/components/website/PropertyDetailsModal';
import PropertyFeaturedSlider from '@/components/website/PropertyFeaturedSlider';
import { Testimonials } from '@/components/website/Testimonials';
import { useLoading } from "@/contexts/LoadingContext";
import SEO from '@/components/website/SEO';
import Footer from '@/components/Footer';
import LazyImage from '@/components/ui/lazy-image';
import HomeSections from '@/components/website/HomeSections';
import '../styles/hover-effects.css';
import imobsiteLogo from '../assets/imobsite-logo.png';

// Função utilitária para obter a imagem de destaque do imóvel
const getFeaturedImage = (property: Property): string | undefined => {
  // Se tiver array de imagens com formato { url, isFeatured }
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    // Procura por uma imagem marcada como destaque
    const featuredImage = property.images.find(img => 
      typeof img === 'object' && 'isFeatured' in img && img.isFeatured
    );
    
    // Se encontrou imagem de destaque, retorna sua URL
    if (featuredImage && typeof featuredImage === 'object' && 'url' in featuredImage) {
      return featuredImage.url;
    }
    
    // Se não encontrou imagem de destaque, retorna a primeira imagem
    if (property.images[0] && typeof property.images[0] === 'object' && 'url' in property.images[0]) {
      return property.images[0].url;
    }
  }
  
  return undefined;
};

export default function Home() {
  const [location, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const [carouselPage, setCarouselPage] = useState(0);
  const { stopLoading } = useLoading();
  
  // Estado para o modal de detalhes do imóvel
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Função para abrir o modal
  const openPropertyModal = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setIsModalOpen(true);
  };
  
  // Função para fechar o modal
  const closePropertyModal = () => {
    setIsModalOpen(false);
  };

  const { data: config, isLoading: isLoadingConfig } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    queryFn: async () => {
      return apiRequest<WebsiteConfig>('/api/website/config');
    },
  });

  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      return apiRequest<Property[]>('/api/properties');
    },
  });
  
  // Filtra apenas os imóveis marcados como destaque
  const featuredProperties = properties?.filter(property => property.isFeatured) || [];
  
  // Calcula o número de páginas no carrossel baseado na quantidade de imóveis em destaque
  const itemsPerPage = 4; // Quantidade de itens por página do carrossel
  const totalCarouselPages = featuredProperties.length > 0 
    ? Math.ceil(featuredProperties.length / itemsPerPage) 
    : 1;

  // Efeito para monitorar o scroll e mudar a aparência do header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Definindo as fontes com base na configuração
  useEffect(() => {
    if (config) {
      // Configurar fontes
      document.documentElement.style.setProperty('--heading-font', `'${config.headingFont || 'Inter'}', sans-serif`);
      document.documentElement.style.setProperty('--body-font', `'${config.bodyFont || 'Inter'}', sans-serif`);
      
      // Configurar cores
      document.documentElement.style.setProperty('--primary', config.primaryColor || '#3B82F6');
      document.documentElement.style.setProperty('--secondary', config.secondaryColor || '#10B981');
      
      console.log('Fontes aplicadas:', {
        heading: config.headingFont,
        body: config.bodyFont
      });
      
      // Debug das configurações
      console.log('Configurações:', config);
      console.log('Telefone:', config.phone);
    }
  }, [config]);
  
  // Parar a animação de carregamento quando os dados forem carregados
  useEffect(() => {
    if (!isLoadingProperties && !isLoadingConfig) {
      stopLoading();
      
      // Pré-carregar imagens de destaque para melhorar o desempenho percebido
      if (properties && properties.length > 0) {
        // Priorizar o carregamento das primeiras 3 imagens (visíveis imediatamente)
        const firstImages = properties.slice(0, 3)
          .map(prop => getFeaturedImage(prop))
          .filter(Boolean) as string[];
          
        if (firstImages.length > 0) {
          // Criar Image objects para pré-carregar
          firstImages.forEach(src => {
            const img = new Image();
            img.src = src;
          });
        }
        
        // Carregar o restante das imagens com um atraso
        setTimeout(() => {
          const remainingImages = properties.slice(3)
            .map(prop => getFeaturedImage(prop))
            .filter(Boolean) as string[];
            
          remainingImages.forEach(src => {
            const img = new Image();
            img.loading = 'lazy';
            img.src = src;
          });
        }, 3000);
      }
    }
  }, [isLoadingProperties, isLoadingConfig, stopLoading, properties]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO Component */}
      <SEO 
        title={config?.seoTitle}
        description={config?.seoDescription}
        keywords={config?.seoKeywords}
        favicon={config?.logo}
        ogImage={config?.bannerBackground}
      />
      
      {/* Usar o componente Header reutilizável */}
      <Header config={config} isLoadingConfig={isLoadingConfig} />
      
      {/* Hero Section */}
      <section 
        id="home" 
        className="pt-36 pb-32 md:pb-48 text-white relative overflow-hidden"
        style={{
          background: !config?.bannerBackground 
            ? (config?.primaryColor 
              ? `linear-gradient(to right, ${config.primaryColor}DD, ${config.primaryColor})` 
              : 'linear-gradient(to right, #3b82f6, var(--primary))')
            : 'transparent'
        }}
      >
        {config?.bannerBackground && (
          <>
            {/* Fundo de cor para exibir enquanto carrega a imagem */}
            <div 
              className="absolute inset-0 z-0"
              style={{ 
                background: config?.primaryColor 
                  ? `linear-gradient(to right, ${config.primaryColor}DD, ${config.primaryColor})` 
                  : 'linear-gradient(to right, #3b82f6, var(--primary))'
              }}
            ></div>
            {/* Imagem de fundo com lazy loading e fade in */}
            <div 
              className="absolute inset-0 z-0 bg-black/50"
              style={{
                backgroundImage: `url(${config.bannerBackground})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                opacity: 1,
                transition: 'opacity 0.5s ease-in'
              }}
            ></div>
          </>
        )}
        <div className="container mx-auto px-4 text-center relative z-20">
          {config?.showBannerText && (
            <div className="mx-auto max-w-4xl mb-6 md:mb-10 pt-8 md:pt-12 px-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 md:mb-4">{config?.bannerTitle || "Encontre o imóvel dos seus sonhos"}</h1>
              {config?.bannerSubtitle && (
                <p className="text-lg mb-4 md:mb-8">{config.bannerSubtitle}</p>
              )}
            </div>
          )}
          
          {/* Barra de Filtro */}
          {config?.showSearchBar && (
            <div 
              className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-md p-3 md:p-5 shadow-xl"
            >
              <form 
                className="flex flex-col md:flex-row gap-2 md:gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  
                  // Obter os valores dos campos
                  const formData = new FormData(e.currentTarget);
                  const tipo = formData.get('tipo') as string;
                  const cidade = formData.get('cidade') as string;
                  const finalidade = formData.get('finalidade') as string;
                  
                  // Construir a URL com os parâmetros de busca
                  let url = '/properties?';
                  const params = new URLSearchParams();
                  
                  if (tipo && tipo !== 'all') {
                    params.append('type', tipo);
                  }
                  
                  if (cidade) {
                    params.append('city', cidade);
                  }
                  
                  if (finalidade === 'comprar') {
                    params.append('purpose', 'sale');
                  } else if (finalidade === 'alugar') {
                    params.append('purpose', 'rent');
                  }
                  
                  // Redirecionar para a página de propriedades com os filtros
                  setLocation(`/properties?${params.toString()}`);
                }}
              >
                {/* Tipo de Imóvel */}
                <div className="flex-1">
                  <div className="relative">
                    <select 
                      name="tipo"
                      className="w-full appearance-none rounded-md px-4 py-3 bg-white border text-black text-sm"
                      style={{ 
                        borderWidth: '0.5px', 
                        borderColor: config?.primaryColor ? `${config.primaryColor}40` : '#8BC34A40' 
                      }}
                      defaultValue="all"
                    >
                      <option value="all">Tipo de Imóvel</option>
                      <option value="apartment">Apartamento</option>
                      <option value="house">Casa</option>
                      <option value="commercial">Comercial</option>
                      <option value="land">Terreno</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-500 text-xs"></i>
                    </div>
                  </div>
                </div>
                
                {/* Localização/Cidade */}
                <div className="flex-1">
                  <input 
                    type="text"
                    name="cidade"
                    placeholder="Cidade"
                    className="w-full rounded-md px-4 py-3 bg-white border text-black text-sm"
                    style={{ 
                      borderWidth: '0.5px', 
                      borderColor: config?.primaryColor ? `${config.primaryColor}40` : '#8BC34A40' 
                    }}
                  />
                </div>
                
                {/* Finalidade */}
                <div className="flex-1">
                  <div className="relative">
                    <select 
                      name="finalidade"
                      className="w-full appearance-none rounded-md px-4 py-3 bg-white border text-black text-sm"
                      style={{ 
                        borderWidth: '0.5px', 
                        borderColor: config?.primaryColor ? `${config.primaryColor}40` : '#8BC34A40' 
                      }}
                      defaultValue="all"
                    >
                      <option value="all">Comprar ou Alugar</option>
                      <option value="comprar">Comprar</option>
                      <option value="alugar">Alugar</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-500 text-xs"></i>
                    </div>
                  </div>
                </div>
                
                {/* Botão Buscar */}
                <div className="flex-initial">
                  <button 
                    type="submit"
                    className="w-full rounded-md py-3 px-4 text-white text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                    style={{ 
                      backgroundColor: config?.primaryColor || '#8BC34A',
                      minWidth: '100px'
                    }}
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Cards de qualidades sobrepostos no rodapé do Hero */}
      {config?.showQualityCards !== false && (
        <div className="relative z-10 -mt-24 mb-8">
          <div className="container mx-auto px-4">
            {/* Exibição em desktop: grid normal */}
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              
              {/* Primeiro Card */}
              {config?.qualityCard1Enabled !== false && (
                <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                  <h3 className="text-xl font-semibold mb-3">{config?.qualityCard1Title || 'Os melhores imóveis'}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {config?.qualityCard1Text || 'Escolha entre apartamentos, casas, salas, ... Considere uma visita com um dos nossos corretores'}
                  </p>
                </div>
              )}
              
              {/* Segundo Card */}
              {config?.qualityCard2Enabled !== false && (
                <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                  <h3 className="text-xl font-semibold mb-3">{config?.qualityCard2Title || 'Vamos acompanhar você'}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {config?.qualityCard2Text || 'Oferecemos a você a melhor consultoria na escolha do seu imóvel, desde a escolha da localização, tipo e características'}
                  </p>
                </div>
              )}
              
              {/* Terceiro Card */}
              {config?.qualityCard3Enabled !== false && (
                <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                  <h3 className="text-xl font-semibold mb-3">{config?.qualityCard3Title || 'Sempre a melhor condição'}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {config?.qualityCard3Text || 'Nossa equipe irá buscar a melhor condição de fechamento, inclusive oferecendo consultoria no financiamento'}
                  </p>
                </div>
              )}
              
            </div>
            
            {/* Exibição em mobile: carrossel */}
            <div className="md:hidden relative">
              <div className="overflow-x-auto pb-4 flex snap-x snap-mandatory scrollbar-hide">
                {/* Cards do carrossel */}
                {config?.qualityCard1Enabled !== false && (
                  <div className="snap-center flex-shrink-0 w-full px-1">
                    <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                      <h3 className="text-xl font-semibold mb-3">{config?.qualityCard1Title || 'Os melhores imóveis'}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {config?.qualityCard1Text || 'Escolha entre apartamentos, casas, salas, ... Considere uma visita com um dos nossos corretores'}
                      </p>
                    </div>
                  </div>
                )}
                
                {config?.qualityCard2Enabled !== false && (
                  <div className="snap-center flex-shrink-0 w-full px-1">
                    <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                      <h3 className="text-xl font-semibold mb-3">{config?.qualityCard2Title || 'Vamos acompanhar você'}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {config?.qualityCard2Text || 'Oferecemos a você a melhor consultoria na escolha do seu imóvel, desde a escolha da localização, tipo e características'}
                      </p>
                    </div>
                  </div>
                )}
                
                {config?.qualityCard3Enabled !== false && (
                  <div className="snap-center flex-shrink-0 w-full px-1">
                    <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                      <h3 className="text-xl font-semibold mb-3">{config?.qualityCard3Title || 'Sempre a melhor condição'}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {config?.qualityCard3Text || 'Nossa equipe irá buscar a melhor condição de fechamento, inclusive oferecendo consultoria no financiamento'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Indicadores de página */}
              <div className="flex justify-center mt-4 space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-100"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 opacity-50"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 opacity-50"></span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Slider de imóveis destacados */}
      {config?.showFeaturedProperties !== false && featuredProperties.length > 0 && (
        <PropertyFeaturedSlider 
          properties={featuredProperties} 
          onPropertyClick={openPropertyModal}
          config={config}
        />
      )}

      {/* Properties Section - Imóveis para Aluguel */}
      {config?.showRentProperties !== false && (
        <section id="rent-properties" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-left mb-12" style={{ color: config?.primaryColor || 'var(--primary)' }}>Imóveis para Aluguel</h2>
            
            {isLoadingProperties ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
                  <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {properties?.filter(property => property.purpose === 'rent' && property.status === 'available')
                  .slice(0, 8)
                  .map((property) => (
                    <div key={property.id}>
                      <div 
                        className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer relative"
                        onClick={() => openPropertyModal(property.id)}
                      >
                        {/* Property Image */}
                        <div className="property-image-container h-48 relative overflow-hidden">
                          {getFeaturedImage(property) ? (
                            <LazyImage 
                              src={getFeaturedImage(property)} 
                              alt={property.title || 'Imóvel'} 
                              className="property-image w-full h-full"
                              placeholderColor={config?.primaryColor ? `${config.primaryColor}15` : '#f3f4f6'}
                              aspectRatio="4/3"
                            />
                          ) : null}
                          {/* Botão Ver Detalhes que aparece no hover */}
                          <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                            <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                              <i className="fas fa-eye text-sm" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                              <span className="text-sm font-medium" style={{ color: config?.primaryColor || 'var(--primary)' }}>Ver Detalhes</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Property Details */}
                        <div className="p-5">
                          <h3 className="text-lg font-semibold mb-2 truncate">{property.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 truncate">{property.neighborhood}, {property.city}</p>
                          
                          {/* Property Price */}
                          <div className="text-lg font-bold mb-3" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                            R$ {property.price?.toLocaleString('pt-BR')}
                            {property.purpose === 'rent' && <span className="text-sm text-gray-600 font-normal">/mês</span>}
                          </div>
                          
                          {/* Property Features */}
                          <div className="flex items-center justify-between mt-2 text-gray-500 text-sm">
                            {property.bedrooms && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faBed} className="mr-1 w-3.5 h-3.5" />
                                <span>{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faBath} className="mr-1 w-3.5 h-3.5" />
                                <span>{property.bathrooms}</span>
                              </div>
                            )}
                            {property.area && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faRulerCombined} className="mr-1 w-3.5 h-3.5" />
                                <span>{property.area}m²</span>
                              </div>
                            )}
                            {property.parkingSpots && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faCar} className="mr-1 w-3.5 h-3.5" />
                                <span>{property.parkingSpots}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Button 
                variant="ghost" 
                className="inline-flex items-center text-base"
                style={{ color: config?.primaryColor || 'var(--primary)' }}
                asChild
              >
                <Link href="/properties?purpose=rent">
                Ver todos os imóveis
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Properties Section - Imóveis para Venda */}
      {config?.showSaleProperties !== false && (
        <section id="sale-properties" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-left mb-12" style={{ color: config?.primaryColor || 'var(--primary)' }}>Imóveis para Venda</h2>
            
            {isLoadingProperties ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
                  <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {properties?.filter(property => property.purpose === 'sale' && property.status === 'available')
                  .slice(0, 8)
                  .map((property) => (
                    <div key={property.id}>
                      <div 
                        className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer relative"
                        onClick={() => openPropertyModal(property.id)}
                      >
                        {/* Property Image */}
                        <div className="property-image-container h-48 relative overflow-hidden">
                          {getFeaturedImage(property) ? (
                            <LazyImage 
                              src={getFeaturedImage(property)} 
                              alt={property.title || 'Imóvel'} 
                              className="property-image w-full h-full"
                              placeholderColor={config?.primaryColor ? `${config.primaryColor}15` : '#f3f4f6'}
                              aspectRatio="4/3"
                            />
                          ) : null}
                          {/* Botão Ver Detalhes que aparece no hover */}
                          <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                            <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                              <i className="fas fa-eye text-sm" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                              <span className="text-sm font-medium" style={{ color: config?.primaryColor || 'var(--primary)' }}>Ver Detalhes</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Property Details */}
                        <div className="p-5">
                          <h3 className="text-lg font-semibold mb-2 truncate">{property.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 truncate">{property.neighborhood}, {property.city}</p>
                          
                          {/* Property Price */}
                          <div className="text-lg font-bold mb-3" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                            R$ {property.price?.toLocaleString('pt-BR')}
                            {property.purpose === 'rent' && <span className="text-sm text-gray-600 font-normal">/mês</span>}
                          </div>
                          
                          {/* Property Features */}
                          <div className="flex items-center justify-between mt-2 text-gray-500 text-sm">
                            {property.bedrooms && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faBed} className="mr-1 w-3.5 h-3.5" />
                                <span>{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faBath} className="mr-1 w-3.5 h-3.5" />
                                <span>{property.bathrooms}</span>
                              </div>
                            )}
                            {property.area && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faRulerCombined} className="mr-1 w-3.5 h-3.5" />
                                <span>{property.area}m²</span>
                              </div>
                            )}
                            {property.parkingSpots && (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faCar} className="mr-1 w-3.5 h-3.5" />
                                <span>{property.parkingSpots}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Button 
                variant="ghost" 
                className="inline-flex items-center text-base"
                style={{ color: config?.primaryColor || 'var(--primary)' }}
                asChild
              >
                <Link href="/properties?purpose=sale">
                Ver todos os imóveis
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {config?.showAboutSection !== false && (
        <section id="about" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h2 className="text-3xl font-bold mb-6" style={{ color: config?.primaryColor || 'var(--primary)' }}>{config?.aboutTitle || 'Quem Somos'}</h2>
                <div className="prose text-gray-600" dangerouslySetInnerHTML={{ __html: config?.aboutDescription || 'Somos uma imobiliária com anos de experiência no mercado imobiliário, oferecendo aos nossos clientes opções de compra, venda e aluguel de imóveis. Trabalhamos com profissionalismo e ética para tornar o seu sonho realidade.' }}></div>
                
                {/* CTA Button abaixo da descrição */}
                <div className="mt-8">
                  <Button 
                    variant="default" 
                    className="px-8 py-3 rounded-md text-white font-semibold"
                    style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}
                    asChild
                  >
                    <Link href="/properties">Ver Nossos Imóveis</Link>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2">
                {config?.aboutImage ? (
                  <img 
                    src={config.aboutImage} 
                    alt="Sobre nós" 
                    className="w-full rounded-lg shadow-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-72 md:h-96 bg-gray-200 rounded-lg"></div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Renderizar seções na ordem configurada pelo usuário */}
      <HomeSections 
        config={config}
        properties={properties}
        isLoadingProperties={isLoadingProperties} 
        featuredProperties={featuredProperties}
        openPropertyModal={openPropertyModal}
      />
      
      {/* Modal para visualização de detalhes do imóvel */}
      {selectedPropertyId && (
        <PropertyDetailsModal 
          propertyId={selectedPropertyId} 
          isOpen={isModalOpen} 
          onClose={closePropertyModal}
          config={config}
        />
      )}
      
      {/* Footer */}
      <Footer config={config} />
    </div>
  );
}