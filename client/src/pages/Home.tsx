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
    }
  }, [isLoadingProperties, isLoadingConfig, stopLoading]);

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
        className="pt-36 pb-32 md:pb-48 text-white"
        style={{
          background: config?.bannerBackground 
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${config.bannerBackground}) center/cover no-repeat`
            : config?.primaryColor 
              ? `linear-gradient(to right, ${config.primaryColor}DD, ${config.primaryColor})` 
              : 'linear-gradient(to right, #3b82f6, var(--primary))'
        }}
      >
        <div className="container mx-auto px-4 text-center">
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

      {/* Slider de Imóveis em Destaque (Horizontal) */}
      <PropertyFeaturedSlider />

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
              
              {/* Indicadores de página (pontos) */}
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Properties Section - Imóveis em Destaque */}
      {config?.showFeaturedProperties !== false && (
        <section id="properties" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Imóveis em Destaque</h2>
            
            {isLoadingProperties ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(item => (
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
              <div className="relative group">
                {/* Botão de navegação - Anterior */}
                <button 
                  onClick={() => {
                    if (!carouselTrackRef.current) return;
                    const containerWidth = carouselTrackRef.current.parentElement?.clientWidth || 0;
                    const newPage = Math.max(0, carouselPage - 1);
                    carouselTrackRef.current.scrollTo({
                      left: containerWidth * newPage,
                      behavior: 'smooth'
                    });
                    setCarouselPage(newPage);
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed"
                  disabled={carouselPage === 0}
                  aria-label="Imóveis anteriores"
                >
                  <i className="ri-arrow-left-circle-fill text-4xl" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                </button>
                
                {/* Botão de navegação - Próximo */}
                <button 
                  onClick={() => {
                    if (!carouselTrackRef.current) return;
                    const containerWidth = carouselTrackRef.current.parentElement?.clientWidth || 0;
                    const newPage = Math.min(totalCarouselPages - 1, carouselPage + 1);
                    carouselTrackRef.current.scrollTo({
                      left: containerWidth * newPage,
                      behavior: 'smooth'
                    });
                    setCarouselPage(newPage);
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed"
                  disabled={carouselPage === totalCarouselPages - 1}
                  aria-label="Próximos imóveis"
                >
                  <i className="ri-arrow-right-circle-fill text-4xl" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                </button>
                
                {/* Carrossel */}
                <div className="carousel-container overflow-hidden">
                  <div 
                    ref={carouselTrackRef}
                    id="carousel-track"
                    className="carousel-track flex space-x-4 py-4 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onScroll={(e) => {
                      if (!carouselTrackRef.current) return;
                      const containerWidth = carouselTrackRef.current.parentElement?.clientWidth || 0;
                      const scrollPosition = e.currentTarget.scrollLeft;
                      const newPage = Math.round(scrollPosition / containerWidth);
                      if (newPage !== carouselPage) {
                        setCarouselPage(newPage);
                      }
                    }}
                  >
                    {featuredProperties.map((property) => (
                      <div key={property.id} className="carousel-item flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2">
                        <div 
                          className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer relative"
                          onClick={() => openPropertyModal(property.id)}
                        >
                          {/* Property Image */}
                          <div className="property-image-container h-48 bg-gray-200 relative overflow-hidden">
                            {getFeaturedImage(property) ? (
                              <img 
                                src={getFeaturedImage(property)} 
                                alt={property.title} 
                                className="property-image w-full h-full object-cover transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : null}
                            {/* Botão Ver Detalhes que aparece no hover */}
                            <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                              <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                                <i className="fas fa-eye text-sm" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                                <span className="text-sm font-medium" style={{ color: config?.primaryColor || 'var(--primary)' }}>Ver Detalhes</span>
                              </div>
                            </div>
                            <div 
                              className="absolute bottom-0 left-0 text-white px-3 py-1 rounded-tr-lg"
                              style={{
                                backgroundColor: config?.primaryColor || 'var(--primary)'
                              }}
                            >
                              {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-md mb-1 line-clamp-1">{property.title}</h3>
                            <div className="flex justify-start items-center mb-2">
                              <div 
                                className="text-lg font-bold text-gray-700"
                              >
                                R$ {property.price.toLocaleString('pt-BR')}
                                {property.purpose === 'rent' && <span className="text-xs font-normal text-gray-500">/mês</span>}
                              </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-1">{property.address}</p>
                            
                            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <i className="fas fa-ruler-combined fa-sm mr-1"></i>
                                {property.area}m²
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-bed fa-sm mr-1"></i>
                                {property.bedrooms}
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-shower fa-sm mr-1" style={{ color: '#4B5563' }}></i>
                                {property.bathrooms}
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-bath fa-sm mr-1" style={{ color: '#4B5563' }}></i>
                                {property.suites || 0}
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-car fa-sm mr-1"></i>
                                {property.parkingSpots || 0}
                              </span>
                            </div>
                          </div>
                          
                          {/* Overlay de hover para indicar que é clicável */}
                          <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-5"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Indicadores de página */}
                  <div className="flex justify-center space-x-2 mt-6">
                    {[...Array(totalCarouselPages)].map((_, index) => (
                      <button 
                        key={index} 
                        className={`h-2 rounded-full transition-all ${
                          index === carouselPage 
                            ? 'w-8 bg-gray-800' 
                            : 'w-2 bg-gray-300'
                        }`}
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
                        style={{
                          backgroundColor: index === carouselPage 
                            ? (config?.primaryColor || 'var(--primary)') 
                            : undefined
                        }}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setLocation('/properties')}
                style={{
                  borderColor: config?.primaryColor || 'var(--primary)',
                  color: config?.primaryColor || 'var(--primary)'
                }}
              >
                Ver todos os imóveis
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Properties Section - Imóveis para Venda */}
      {config?.showSaleProperties !== false && (
        <section id="sale-properties" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Imóveis para Venda</h2>
            
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
                        <div className="property-image-container h-48 bg-gray-200 relative overflow-hidden">
                          {getFeaturedImage(property) ? (
                            <img 
                              src={getFeaturedImage(property)} 
                              alt={property.title} 
                              className="property-image w-full h-full object-cover transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : null}
                          {/* Botão Ver Detalhes que aparece no hover */}
                          <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                            <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                              <i className="fas fa-eye text-sm" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                              <span className="text-sm font-medium" style={{ color: config?.primaryColor || 'var(--primary)' }}>Ver Detalhes</span>
                            </div>
                          </div>
                          <div 
                            className="absolute bottom-0 left-0 text-white px-3 py-1 rounded-tr-lg"
                            style={{
                              backgroundColor: config?.primaryColor || 'var(--primary)'
                            }}
                          >
                            Venda
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-md mb-1 line-clamp-1">{property.title}</h3>
                          <div className="flex justify-start items-center mb-2">
                            <div className="text-lg font-bold text-gray-700">
                              R$ {property.price.toLocaleString('pt-BR')}
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-1">{property.address}</p>
                          
                          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <i className="fas fa-ruler-combined fa-sm mr-1"></i>
                              {property.area}m²
                            </span>
                            <span className="flex items-center">
                              <i className="fas fa-bed fa-sm mr-1"></i>
                              {property.bedrooms}
                            </span>
                            <span className="flex items-center">
                              <i className="fas fa-shower fa-sm mr-1" style={{ color: '#4B5563' }}></i>
                              {property.bathrooms}
                            </span>
                            <span className="flex items-center">
                              <i className="fas fa-car fa-sm mr-1"></i>
                              {property.parkingSpots || 0}
                            </span>
                          </div>
                        </div>
                        
                        {/* Overlay de hover para indicar que é clicável */}
                        <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-5"></div>
                      </div>
                    </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setLocation('/properties?purpose=sale')}
                style={{
                  borderColor: config?.primaryColor || 'var(--primary)',
                  color: config?.primaryColor || 'var(--primary)'
                }}
              >
                Ver todos os imóveis para venda
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Properties Section - Imóveis para Aluguel */}
      {config?.showRentProperties !== false && (
        <section id="rent-properties" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Imóveis para Aluguel</h2>
            
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
                        <div className="property-image-container h-48 bg-gray-200 relative overflow-hidden">
                          {getFeaturedImage(property) ? (
                            <img 
                              src={getFeaturedImage(property)} 
                              alt={property.title} 
                              className="property-image w-full h-full object-cover transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : null}
                          {/* Botão Ver Detalhes que aparece no hover */}
                          <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                            <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                              <i className="fas fa-eye text-sm" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                              <span className="text-sm font-medium" style={{ color: config?.primaryColor || 'var(--primary)' }}>Ver Detalhes</span>
                            </div>
                          </div>
                          <div 
                            className="absolute bottom-0 left-0 text-white px-3 py-1 rounded-tr-lg"
                            style={{
                              backgroundColor: config?.primaryColor || 'var(--primary)'
                            }}
                          >
                            Aluguel
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-md mb-1 line-clamp-1">{property.title}</h3>
                          <div className="flex justify-start items-center mb-2">
                            <div className="text-lg font-bold text-gray-700">
                              R$ {property.price.toLocaleString('pt-BR')}
                              <span className="text-xs font-normal text-gray-500">/mês</span>
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-1">{property.address}</p>
                          
                          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <i className="fas fa-ruler-combined fa-sm mr-1"></i>
                              {property.area}m²
                            </span>
                            <span className="flex items-center">
                              <i className="fas fa-bed fa-sm mr-1"></i>
                              {property.bedrooms}
                            </span>
                            <span className="flex items-center">
                              <i className="fas fa-shower fa-sm mr-1" style={{ color: '#4B5563' }}></i>
                              {property.bathrooms}
                            </span>
                            <span className="flex items-center">
                              <i className="fas fa-car fa-sm mr-1"></i>
                              {property.parkingSpots || 0}
                            </span>
                          </div>
                        </div>
                        
                        {/* Overlay de hover para indicar que é clicável */}
                        <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-5"></div>
                      </div>
                    </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setLocation('/properties?purpose=rent')}
                style={{
                  borderColor: config?.primaryColor || 'var(--primary)',
                  color: config?.primaryColor || 'var(--primary)'
                }}
              >
                Ver todos os imóveis para aluguel
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* About Section - só exibe se showAboutSection for true */}
      {config?.showAboutSection && (
        <section id="about" className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                {config.aboutImage ? (
                  <div className="h-96 rounded-lg overflow-hidden">
                    <img 
                      src={config.aboutImage} 
                      alt={config.aboutTitle || "Quem Somos"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-200 h-96 rounded-lg"></div>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-3">
                  {config.aboutTitle || "Quem Somos"}
                </h2>
                {config.aboutSubtitle && (
                  <h3 className="text-xl text-gray-700 mb-6">
                    {config.aboutSubtitle}
                  </h3>
                )}
                
                {config.aboutDescription ? (
                  <div className="text-gray-600 mb-8 whitespace-pre-line">
                    {config.aboutDescription}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-6">
                      Nossa imobiliária atua no mercado há mais de 15 anos, oferecendo as melhores opções de imóveis para nossos clientes. 
                      Contamos com uma equipe de corretores especializados prontos para encontrar o imóvel ideal para você.
                    </p>
                    <p className="text-gray-600 mb-8">
                      Trabalhamos com imóveis residenciais e comerciais, tanto para compra quanto para locação. 
                      Nosso objetivo é proporcionar uma experiência tranquila e segura em todas as etapas da negociação.
                    </p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 flex-shrink-0"
                          style={{ color: config?.primaryColor || 'var(--primary)' }}
                        >
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                        <span>Atendimento personalizado</span>
                      </li>
                      <li className="flex items-start">
                        <i 
                          className="ri-check-line text-xl mr-2"
                          style={{ color: config?.primaryColor || 'var(--primary)' }}
                        ></i>
                        <span>Assessoria jurídica completa</span>
                      </li>
                      <li className="flex items-start">
                        <i 
                          className="ri-check-line text-xl mr-2"
                          style={{ color: config?.primaryColor || 'var(--primary)' }}
                        ></i>
                        <span>Corretores experientes</span>
                      </li>
                      <li className="flex items-start">
                        <i 
                          className="ri-check-line text-xl mr-2"
                          style={{ color: config?.primaryColor || 'var(--primary)' }}
                        ></i>
                        <span>Parceria com os principais bancos</span>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {config?.showTestimonials !== false && (
        <Testimonials />
      )}



      {/* Footer */}
      <Footer config={config} isLoadingConfig={isLoadingConfig} />
      
      {/* Modal de detalhes do imóvel */}
      {isModalOpen && selectedPropertyId && (
        <PropertyDetailsModal
          propertyId={selectedPropertyId}
          isOpen={isModalOpen}
          onClose={closePropertyModal}
        />
      )}
    </div>
  );
}