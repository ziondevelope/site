import React, { useState, useEffect } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyFeaturedSliderProps {
  openPropertyModal?: (propertyId: number) => void;
  onPropertyClick?: (propertyId: number) => void;
  properties?: Property[];
  config?: WebsiteConfig;
}

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  primaryColor: string;
}

// Componente de card individual para imóvel
const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, primaryColor }) => {
  // Função para formatar o preço em moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // Selecionar a imagem principal
  const mainImage = (property.images && property.images.length > 0
    ? typeof property.images[0] === 'string'
      ? property.images[0]
      : property.images[0].url
    : '');

  return (
    <div 
      className="h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 md:h-52">
        <img 
          src={mainImage} 
          alt={property.title || 'Imóvel'} 
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute bottom-0 left-0 text-white px-3 py-1 rounded-tr-lg"
          style={{ backgroundColor: primaryColor }}
        >
          {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
        </div>
        
        {/* Overlay com ação de visualizar */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20">
          <div className="bg-white/90 px-3 py-2 rounded-md flex items-center gap-2">
            <i className="fas fa-eye text-sm" style={{ color: primaryColor }}></i>
            <span style={{ color: primaryColor }}>Ver Detalhes</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-md font-medium mb-1 line-clamp-1">{property.title}</h3>
        <div className="text-lg font-bold text-gray-800 mb-2">
          R$ {formatCurrency(property.price)}
          {property.purpose === 'rent' && <span className="text-xs font-normal text-gray-500">/mês</span>}
        </div>
        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
          {property.neighborhood}{property.city ? `, ${property.city}` : ''}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <i className="fas fa-ruler-combined mr-1"></i>
            {property.area}m²
          </div>
          <div className="flex items-center">
            <i className="fas fa-bed mr-1"></i>
            {property.bedrooms || 0}
          </div>
          <div className="flex items-center">
            <i className="fas fa-bath mr-1"></i>
            {property.bathrooms || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyFeaturedSlider: React.FC<PropertyFeaturedSliderProps> = ({
  openPropertyModal,
  onPropertyClick,
  properties: propProperties,
  config: propConfig
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(4);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Obter configurações do site
  const { data: configData } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    staleTime: 0
  });
  
  // Use sempre os dados mais recentes
  const config = configData || propConfig;
  const primaryColor = config?.primaryColor || '#7f651e';
  
  // Se as propriedades não forem fornecidas, busque-as
  const { data: propertiesData, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !propProperties,
    select: (data) => data.filter(property => property.isFeatured)
  });
  
  // Use as propriedades passadas como prop ou as obtidas pela consulta
  const properties = propProperties || propertiesData || [];
  
  // Determinar quantos itens mostrar com base na largura da tela
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleItems(1);
      } else if (width < 1024) {
        setVisibleItems(2);
      } else if (width < 1280) {
        setVisibleItems(3);
      } else {
        setVisibleItems(4);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calcular o número máximo de páginas
  const pageCount = Math.max(1, Math.ceil(properties.length / visibleItems));
  
  // Estado para armazenar posição do swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  
  // Função para navegar para a próxima página com animação suave
  const nextPage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Efeito visual de transição
    const sliderElement = document.querySelector('.property-slider-container');
    if (sliderElement) {
      sliderElement.classList.add('transition-opacity');
      sliderElement.classList.add('opacity-80');
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % pageCount);
        
        // Restaura a opacidade após a mudança
        setTimeout(() => {
          sliderElement.classList.remove('opacity-80');
          setTimeout(() => {
            sliderElement.classList.remove('transition-opacity');
            setIsTransitioning(false);
          }, 300);
        }, 200);
      }, 150);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % pageCount);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };
  
  // Função para navegar para a página anterior com animação suave
  const prevPage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Efeito visual de transição
    const sliderElement = document.querySelector('.property-slider-container');
    if (sliderElement) {
      sliderElement.classList.add('transition-opacity');
      sliderElement.classList.add('opacity-80');
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? pageCount - 1 : prevIndex - 1));
        
        // Restaura a opacidade após a mudança
        setTimeout(() => {
          sliderElement.classList.remove('opacity-80');
          setTimeout(() => {
            sliderElement.classList.remove('transition-opacity');
            setIsTransitioning(false);
          }, 300);
        }, 200);
      }, 150);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? pageCount - 1 : prevIndex - 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };
  
  // Função para ir para uma página específica com animação suave
  const goToPage = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    
    // Efeito visual de transição
    const sliderElement = document.querySelector('.property-slider-container');
    if (sliderElement) {
      sliderElement.classList.add('transition-opacity');
      sliderElement.classList.add('opacity-80');
      
      setTimeout(() => {
        setCurrentIndex(index);
        
        // Restaura a opacidade após a mudança
        setTimeout(() => {
          sliderElement.classList.remove('opacity-80');
          setTimeout(() => {
            sliderElement.classList.remove('transition-opacity');
            setIsTransitioning(false);
          }, 300);
        }, 200);
      }, 150);
    } else {
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };
  
  // Manipuladores de eventos de toque para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setAutoplayPaused(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && !isTransitioning) {
      nextPage();
    } else if (isRightSwipe && !isTransitioning) {
      prevPage();
    }
    
    // Reseta valores de toque
    setTouchStart(0);
    setTouchEnd(0);
    
    // Restaura autoplay após 3 segundos
    setTimeout(() => setAutoplayPaused(false), 3000);
  };
  
  // Manipuladores de eventos do mouse para pausar autoplay
  const handleMouseEnter = () => {
    setAutoplayPaused(true);
  };
  
  const handleMouseLeave = () => {
    setAutoplayPaused(false);
  };
  
  // Autoplay com pausa/retomada
  useEffect(() => {
    if (pageCount <= 1 || autoplayPaused) return;
    
    const interval = setInterval(() => {
      if (!isTransitioning && !autoplayPaused) {
        nextPage();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, pageCount, isTransitioning, autoplayPaused]);
  
  // Adicionar uma classe CSS para animar a transição
  useEffect(() => {
    // Quando o componente é montado ou o índice atual muda,
    // adicionamos um efeito sutil de entrada
    const sliderContainer = document.querySelector('.property-slider-container');
    if (sliderContainer) {
      sliderContainer.classList.add('opacity-0');
      setTimeout(() => {
        sliderContainer.classList.remove('opacity-0');
        sliderContainer.classList.add('animate-fade-in');
        
        // Remover a classe de animação após a conclusão
        setTimeout(() => {
          sliderContainer.classList.remove('animate-fade-in');
        }, 500);
      }, 50);
    }
  }, [currentIndex]);
  
  // Handler para clicar em uma propriedade
  const handlePropertyClick = (id: number) => {
    if (openPropertyModal) {
      openPropertyModal(id);
    } else if (onPropertyClick) {
      onPropertyClick(id);
    }
  };
  
  if (isLoading || properties.length === 0) {
    return null;
  }
  
  // Determinar quais propriedades mostrar na página atual
  const startIdx = currentIndex * visibleItems;
  const visibleProperties = properties.slice(startIdx, startIdx + visibleItems);
  
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Cabeçalho da seção */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="w-1.5 h-10 rounded-full mr-3" style={{ backgroundColor: primaryColor }}></div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Imóveis Exclusivos</h2>
          </div>
          
          {/* Navegação para desktop */}
          {pageCount > 1 && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-2">
                <button 
                  onClick={prevPage}
                  className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={nextPage}
                  className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Indicadores de páginas para desktop */}
              <div className="hidden md:flex space-x-1.5">
                {Array.from({ length: pageCount }).map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`h-1.5 transition-all rounded-full ${
                      index === currentIndex ? 'w-8' : 'w-3 bg-gray-300'
                    }`}
                    aria-label={`Ir para página ${index + 1}`}
                    style={{ backgroundColor: index === currentIndex ? primaryColor : undefined }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Grid responsivo de cards de propriedades */}
        <div className="relative">
          <div 
            className="property-slider-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {visibleProperties.map((property) => (
              <div key={property.id} className="h-full">
                <PropertyCard
                  property={property}
                  onClick={() => handlePropertyClick(property.id)}
                  primaryColor={primaryColor}
                />
              </div>
            ))}
          </div>
          
          {/* Botões de navegação para dispositivos móveis */}
          {pageCount > 1 && (
            <>
              <button 
                onClick={prevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all z-10 md:hidden"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
              <button 
                onClick={nextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all z-10 md:hidden"
                aria-label="Próxima página"
              >
                <ChevronRight className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
            </>
          )}
        </div>
        
        {/* Indicadores de páginas para dispositivos móveis */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-6 space-x-1.5 md:hidden">
            {Array.from({ length: pageCount }).map((_, index) => (
              <button 
                key={index}
                onClick={() => goToPage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-gray-800' : 'bg-gray-300'
                }`}
                aria-label={`Ir para página ${index + 1}`}
                style={{ backgroundColor: index === currentIndex ? primaryColor : undefined }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyFeaturedSlider;