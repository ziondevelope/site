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
import { Testimonials } from '@/components/website/Testimonials';
import { useLoading } from "@/contexts/LoadingContext";
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
      {/* Usar o componente Header reutilizável */}
      <Header config={config} isLoadingConfig={isLoadingConfig} />
      
      {/* Hero Section */}
      <section 
        id="home" 
        className="pt-36 pb-24 md:pb-36 text-white"
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
            <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-md p-3 md:p-5 shadow-xl">
              <form className="flex flex-col md:flex-row gap-2 md:gap-3">
                {/* Tipo de Imóvel */}
                <div className="flex-1">
                  <div className="relative">
                    <select 
                      className="w-full appearance-none rounded-md px-4 py-3 bg-white border border-gray-200 text-black text-sm"
                      defaultValue="apartment"
                    >
                      <option value="apartment">Tipo de Imóvel</option>
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
                    placeholder="Cidade"
                    className="w-full rounded-md px-4 py-3 bg-white border border-gray-200 text-black text-sm"
                  />
                </div>
                
                {/* Finalidade */}
                <div className="flex-1">
                  <div className="relative">
                    <select 
                      className="w-full appearance-none rounded-md px-4 py-3 bg-white border border-gray-200 text-black text-sm"
                      defaultValue="comprar"
                    >
                      <option value="comprar">Comprar ou Alugar</option>
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
                            <p className="text-gray-600 text-sm line-clamp-1">{property.city || property.address || 'Localização não disponível'}</p>
                            
                            <div className="flex justify-between items-center mt-3">
                              <span className="font-semibold" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                                {property.price && property.price > 0 
                                  ? `R$ ${property.price.toLocaleString('pt-BR')}`
                                  : 'Sob consulta'
                                }
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 mt-3 text-gray-600">
                              {property.bedrooms ? (
                                <div className="flex items-center text-xs">
                                  <FontAwesomeIcon icon={faBed} className="mr-1" />
                                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</span>
                                </div>
                              ) : null}
                              
                              {property.bathrooms ? (
                                <div className="flex items-center text-xs">
                                  <FontAwesomeIcon icon={faBath} style={{ color: config?.primaryColor }} className="mr-1" />
                                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}</span>
                                </div>
                              ) : null}
                              
                              {property.area ? (
                                <div className="flex items-center text-xs">
                                  <FontAwesomeIcon icon={faRulerCombined} className="mr-1" />
                                  <span>{property.area} m²</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Indicadores de página */}
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from({ length: totalCarouselPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (!carouselTrackRef.current) return;
                        const containerWidth = carouselTrackRef.current.parentElement?.clientWidth || 0;
                        carouselTrackRef.current.scrollTo({
                          left: containerWidth * index,
                          behavior: 'smooth'
                        });
                        setCarouselPage(index);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === carouselPage 
                          ? 'bg-primary w-5' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      style={{ 
                        backgroundColor: index === carouselPage 
                          ? config?.primaryColor || 'var(--primary)' 
                          : undefined
                      }}
                      aria-label={`Ir para página ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Ver todos os imóveis */}
                <div className="text-center mt-10">
                  <Link href="/imoveis">
                    <Button 
                      className="px-6 py-2.5 rounded-md font-medium transition-colors hover:bg-opacity-90"
                      style={{ 
                        backgroundColor: config?.primaryColor || 'var(--primary)',
                        color: '#fff'
                      }}
                    >
                      Ver todos os imóveis
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Imóveis para Venda */}
      <section id="venda" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: config?.primaryColor || 'var(--primary)' }}>Imóveis para Venda</h2>
          
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties
                ?.filter(property => property.purpose === 'sale')
                .slice(0, 8)
                .map((property) => (
                  <div 
                    key={property.id} 
                    className="property-card bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
                    onClick={() => openPropertyModal(property.id)}
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {getFeaturedImage(property) ? (
                        <img 
                          src={getFeaturedImage(property)} 
                          alt={property.title} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
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
                      <p className="text-gray-600 text-sm line-clamp-1">{property.location || property.city}</p>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-semibold" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                          {property.price && property.price > 0 
                            ? `R$ ${property.price.toLocaleString('pt-BR')}`
                            : 'Sob consulta'
                          }
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-3 text-gray-600">
                        {property.bedrooms ? (
                          <div className="flex items-center text-xs">
                            <FontAwesomeIcon icon={faBed} className="mr-1" />
                            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</span>
                          </div>
                        ) : null}
                        
                        {property.bathrooms ? (
                          <div className="flex items-center text-xs">
                            <FontAwesomeIcon icon={faBath} style={{ color: config?.primaryColor }} className="mr-1" />
                            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}</span>
                          </div>
                        ) : null}
                        
                        {property.area ? (
                          <div className="flex items-center text-xs">
                            <FontAwesomeIcon icon={faRulerCombined} className="mr-1" />
                            <span>{property.area} m²</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          
          {/* Ver todos os imóveis para venda */}
          <div className="text-center mt-10">
            <Link href="/imoveis?purpose=sale">
              <Button 
                className="px-6 py-2.5 rounded-md font-medium transition-colors hover:bg-opacity-90"
                style={{ 
                  backgroundColor: config?.primaryColor || 'var(--primary)',
                  color: '#fff'
                }}
              >
                Ver mais imóveis para venda
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Imóveis para Aluguel */}
      <section id="aluguel" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: config?.primaryColor || 'var(--primary)' }}>Imóveis para Aluguel</h2>
          
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties
                ?.filter(property => property.purpose === 'rent')
                .slice(0, 8)
                .map((property) => (
                  <div 
                    key={property.id} 
                    className="property-card bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
                    onClick={() => openPropertyModal(property.id)}
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {getFeaturedImage(property) ? (
                        <img 
                          src={getFeaturedImage(property)} 
                          alt={property.title} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
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
                      <p className="text-gray-600 text-sm line-clamp-1">{property.location || property.city}</p>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-semibold" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                          {property.price && property.price > 0 
                            ? `R$ ${property.price.toLocaleString('pt-BR')}`
                            : 'Sob consulta'
                          }
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-3 text-gray-600">
                        {property.bedrooms ? (
                          <div className="flex items-center text-xs">
                            <FontAwesomeIcon icon={faBed} className="mr-1" />
                            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</span>
                          </div>
                        ) : null}
                        
                        {property.bathrooms ? (
                          <div className="flex items-center text-xs">
                            <FontAwesomeIcon icon={faBath} style={{ color: config?.primaryColor }} className="mr-1" />
                            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}</span>
                          </div>
                        ) : null}
                        
                        {property.area ? (
                          <div className="flex items-center text-xs">
                            <FontAwesomeIcon icon={faRulerCombined} className="mr-1" />
                            <span>{property.area} m²</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          
          {/* Ver todos os imóveis para aluguel */}
          <div className="text-center mt-10">
            <Link href="/imoveis?purpose=rent">
              <Button 
                className="px-6 py-2.5 rounded-md font-medium transition-colors hover:bg-opacity-90"
                style={{ 
                  backgroundColor: config?.primaryColor || 'var(--primary)',
                  color: '#fff'
                }}
              >
                Ver mais imóveis para aluguel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {config?.showTestimonials !== false && (
        <Testimonials />
      )}

      {/* Footer */}
      {config?.footerStyle === 'minimal' ? (
        // Rodapé minimalista
        <footer className="border-t border-gray-200">
          <div className="container mx-auto px-4">
            {/* Primeira parte do rodapé */}
            <div className="py-4">
              <div className="flex flex-wrap items-center justify-between">
                {/* Logo à esquerda */}
                <div className="w-auto">
                  {isLoadingConfig ? (
                    <div className="h-8 w-24 rounded animate-pulse bg-gray-200"></div>
                  ) : config?.logo ? (
                    <div className="h-8">
                      <img 
                        src={config.logo} 
                        alt="Logo da Imobiliária" 
                        className="h-full"
                        loading="eager"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" 
                           style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}>
                        <i className="ri-home-line text-xl"></i>
                      </div>
                      <span className="ml-2 text-lg font-semibold">Imobiliária</span>
                    </div>
                  )}
                </div>
                {/* Redes sociais à direita */}
                <div className="flex space-x-3">
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      ) : (
        // Rodapé original completo com 3 colunas
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
                    <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                      <i className="fab fa-facebook-f" style={{ color: config?.secondaryColor || '#333' }}></i>
                    </a>
                    <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                      <i className="fab fa-linkedin-in" style={{ color: config?.secondaryColor || '#333' }}></i>
                    </a>
                    <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                      <i className="fab fa-youtube" style={{ color: config?.secondaryColor || '#333' }}></i>
                    </a>
                    <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                      <i className="fab fa-instagram" style={{ color: config?.secondaryColor || '#333' }}></i>
                    </a>
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
          </div>
        </footer>
      )}
      
      {/* Div com fundo branco e dois grids - fora dos rodapés mas parte visual dele */}
      <div className="bg-white text-gray-800 py-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-0">
            {/* Grid esquerdo com "Feito por" e logo */}
            <div className="flex flex-col items-center md:items-start justify-center pl-4">
              <p className="mb-2 text-sm font-medium">Feito por</p>
              <img src={imobsiteLogo} alt="Imobsite" className="h-8" />
            </div>
            
            {/* Grid direito */}
            <div className="flex flex-col items-center md:items-end justify-center pr-4">
              <p className="text-sm">
                &copy; 2025 ImobSite. 
                <Link href="/admin">
                  <span className="ml-3 hover:text-gray-600 cursor-pointer">Área do Administrador</span>
                </Link>
              </p>
              <div className="flex items-center mt-2">
                <span className="mr-2 text-sm">Tecnologia</span>
                <img src={imobsiteLogo} alt="Imobsite" className="h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

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