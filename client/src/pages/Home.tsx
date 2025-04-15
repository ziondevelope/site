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
import { useLoading } from "@/contexts/LoadingContext";
import '../styles/hover-effects.css';

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
            <div className="mx-auto max-w-3xl mb-6 md:mb-10 pt-8 md:pt-12">
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

      {/* Properties Section */}
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
                          className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer relative"
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
                            {/* Ícone de olho que aparece no hover */}
                            <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                              <div className="rounded-full bg-white/80 p-3 backdrop-blur-sm">
                                <i className="fas fa-eye text-xl" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
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
                            <h3 className="text-lg font-semibold mb-2 line-clamp-1">{property.title}</h3>
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
                                <i className="fas fa-shower fa-sm mr-1"></i>
                                {property.bathrooms}
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-bath fa-sm mr-1" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                                {property.suites || 0}
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-car fa-sm mr-1"></i>
                                {property.parkingSpots || 0}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div 
                                className="text-xl font-bold"
                                style={{ color: config?.primaryColor || 'var(--primary)' }}
                              >
                                R$ {property.price.toLocaleString('pt-BR')}
                                {property.purpose === 'rent' && <span className="text-xs font-normal text-gray-500">/mês</span>}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation(); // Impede que o clique no botão propague para o card
                                  openPropertyModal(property.id);
                                }}
                              >
                                Ver
                              </Button>
                            </div>
                          </div>
                          
                          {/* Overlay de hover para indicar que é clicável */}
                          <div className="absolute inset-0 bg-primary opacity-0 transition-opacity duration-300 hover:opacity-5" 
                            style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}
                          ></div>
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
              <Button variant="outline" size="lg" onClick={() => setLocation('/properties')}>
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

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gray-200 h-96 rounded-lg"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Sobre a Imobiliária</h2>
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
              <Button>Conheça nossa equipe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Entre em contato</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                <Button type="submit" className="w-full">Enviar mensagem</Button>
              </form>
            </div>
            
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Informações de contato</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <i 
                      className="ri-map-pin-line text-xl mr-3 mt-1"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-gray-600">Av. Paulista, 1000 - São Paulo, SP</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <i 
                      className="ri-phone-line text-xl mr-3 mt-1"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-gray-600">(11) 3333-4444</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <i 
                      className="ri-mail-line text-xl mr-3 mt-1"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">contato@imobiliaria.com.br</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <i 
                      className="ri-time-line text-xl mr-3 mt-1"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <div>
                      <p className="font-medium">Horário de funcionamento</p>
                      <p className="text-gray-600">Segunda a Sexta: 9h às 18h</p>
                      <p className="text-gray-600">Sábados: 9h às 13h</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Siga-nos</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-600 hover:text-primary text-2xl">
                    <i className="ri-facebook-circle-fill"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-primary text-2xl">
                    <i className="ri-instagram-fill"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-primary text-2xl">
                    <i className="ri-linkedin-box-fill"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-primary text-2xl">
                    <i className="ri-youtube-fill"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                {isLoadingConfig ? (
                  // Placeholder durante o carregamento - mantém o mesmo tamanho
                  <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
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
                    <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white">
                      <i className="ri-home-line text-xl"></i>
                    </div>
                    <h1 className="text-2xl font-bold">Imobiliária</h1>
                  </>
                )}
              </div>
              <p className="text-gray-400 mb-6">
                Soluções imobiliárias completas para você encontrar o imóvel dos seus sonhos.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="ri-facebook-circle-fill"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="ri-instagram-fill"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="ri-linkedin-box-fill"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="ri-youtube-fill"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Links Rápidos</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">Início</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Imóveis</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Tipos de Imóveis</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">Apartamentos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Casas</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terrenos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Comerciais</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Rurais</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i 
                    className="ri-map-pin-line mr-3 mt-1"
                    style={{ color: config?.primaryColor || 'var(--primary)' }}
                  ></i>
                  <span className="text-gray-400">Av. Paulista, 1000 - São Paulo, SP</span>
                </li>
                <li className="flex items-start">
                  <i 
                    className="ri-phone-line mr-3 mt-1"
                    style={{ color: config?.primaryColor || 'var(--primary)' }}
                  ></i>
                  <span className="text-gray-400">(11) 3333-4444</span>
                </li>
                <li className="flex items-start">
                  <i 
                    className="ri-mail-line mr-3 mt-1"
                    style={{ color: config?.primaryColor || 'var(--primary)' }}
                  ></i>
                  <span className="text-gray-400">contato@imobiliaria.com.br</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Imobiliária. Todos os direitos reservados. 
              <Link href="/admin">
                <span className="ml-3 hover:text-white cursor-pointer">Área do Administrador</span>
              </Link>
            </p>
          </div>
        </div>
      </footer>
      
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