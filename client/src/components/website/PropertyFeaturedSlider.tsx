import React, { useState, useEffect, useRef } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

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
  buttonTextColor: string;
}

// Componente de card individual para imóvel
const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, primaryColor, buttonTextColor }) => {
  // Função para formatar o preço em moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // Selecionar a imagem principal
  const mainImage = property.featuredImage || (property.images && property.images.length > 0
    ? typeof property.images[0] === 'string'
      ? property.images[0]
      : property.images[0].url
    : '');

  return (
    <div 
      className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer relative m-1 p-0.5"
      onClick={onClick}
    >
      {/* Property Image */}
      <div className="property-image-container h-48 relative overflow-hidden">
        <img 
          src={mainImage} 
          alt={property.title || 'Imóvel'} 
          className="property-image w-full h-full object-cover"
        />
        {/* Botão Ver Detalhes que aparece no hover */}
        <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 bg-black/20 group-hover:opacity-100">
          <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
            <i className="fas fa-eye text-sm" style={{ color: primaryColor }}></i>
            <span className="text-sm font-medium" style={{ color: primaryColor }}>Ver Detalhes</span>
          </div>
        </div>
        <div 
          className="absolute bottom-0 left-0 text-white px-3 py-1 rounded-tr-lg"
          style={{ backgroundColor: primaryColor }}
        >
          {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-md mb-1 line-clamp-1 font-medium">{property.title}</h3>
        <div className="flex justify-start items-center mb-2">
          <div className="text-lg font-bold text-gray-700">
            R$ {formatCurrency(property.price)}
            {property.purpose === 'rent' && <span className="text-xs font-normal text-gray-500">/mês</span>}
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-1">
          {property.neighborhood}{property.city ? `, ${property.city}` : ''}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center">
            <i className="fas fa-ruler-combined fa-sm mr-1"></i>
            {property.area}m²
          </span>
          <span className="flex items-center">
            <i className="fas fa-bed fa-sm mr-1"></i>
            {property.bedrooms || 0}
          </span>
          <span className="flex items-center">
            <i className="fas fa-bath fa-sm mr-1"></i>
            {property.bathrooms || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function PropertyFeaturedSlider({ 
  openPropertyModal, 
  onPropertyClick,
  properties: propProperties,
  config: propConfig 
}: PropertyFeaturedSliderProps) {
  // Use onPropertyClick se openPropertyModal não estiver definido
  const handlePropertyClick = openPropertyModal || onPropertyClick;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [visibleProperties, setVisibleProperties] = useState(4);
  
  // Atualizar o número de propriedades visíveis de acordo com o tamanho da tela
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleProperties(1);
      } else if (window.innerWidth < 1024) {
        setVisibleProperties(2);
      } else if (window.innerWidth < 1280) {
        setVisibleProperties(3);
      } else {
        setVisibleProperties(4);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);
  
  // Obter configurações do site para cores (mesmo que tenha sido passado como prop)
  const { data: configData } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    staleTime: 0
  });
  
  // Use sempre os dados mais recentes
  const config = configData || propConfig;
  
  // Define as cores do slider com base nas configurações
  const [primaryColor, setPrimaryColor] = useState(config?.featuredSliderBackgroundColor || config?.primaryColor || '#7f651e');
  const [buttonTextColor, setButtonTextColor] = useState(config?.featuredSliderButtonTextColor || config?.primaryColor || '#7f651e');
  
  // Atualiza as cores quando as configurações mudarem
  useEffect(() => {
    if (config) {
      console.log("Atualizando cores do slider:", {
        backgroundColor: config.featuredSliderBackgroundColor,
        textColor: config.featuredSliderTextColor,
        buttonTextColor: config.featuredSliderButtonTextColor
      });
      setPrimaryColor(config.featuredSliderBackgroundColor || config.primaryColor || '#7f651e');
      setButtonTextColor(config.featuredSliderButtonTextColor || config.primaryColor || '#7f651e');
    }
  }, [config]);
  
  // Se as propriedades não forem fornecidas, busque-as
  const { data: propertiesData, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !propProperties,
    select: (data) => {
      // Filtramos para pegar apenas propriedades destacadas, sem limitar o número
      return data.filter(property => property.isFeatured);
    }
  });
  
  // Use as propriedades passadas como propriedade ou as obtidas pela consulta
  const properties = propProperties || propertiesData || [];

  // Calcule o número máximo de slides com base no número de propriedades visíveis por vez
  const maxSlides = Math.max(0, Math.ceil(properties.length / visibleProperties) - 1);
  
  // Garante que currentSlide está dentro dos limites válidos quando properties ou visibleProperties mudam
  useEffect(() => {
    if (currentSlide > maxSlides) {
      setCurrentSlide(maxSlides);
    }
  }, [properties.length, visibleProperties, currentSlide, maxSlides]);
  
  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || properties.length <= visibleProperties) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(current => {
        return current >= maxSlides ? 0 : current + 1;
      });
    }, 5000); // 5 segundos por slide
    
    return () => clearInterval(interval);
  }, [autoplay, properties.length, visibleProperties, maxSlides]);
  
  // Pausa o autoplay quando o mouse está sobre o slider
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);
  
  // Navegação de slides
  const goToNextSlide = () => {
    setCurrentSlide(current => {
      return current >= maxSlides ? 0 : current + 1;
    });
  };
  
  const goToPrevSlide = () => {
    setCurrentSlide(current => {
      return current <= 0 ? maxSlides : current - 1;
    });
  };

  // Calcular a largura de cada slide com base no número de propriedades visíveis
  const slideWidth = 100 / visibleProperties;
  
  if (isLoading || properties.length === 0) {
    return null;
  }
  
  return (
    <div 
      className="mx-auto py-16 relative bg-gradient-to-b from-white to-gray-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto px-6 md:px-8 overflow-visible">
        {/* Header com título e navegação */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-1.5 h-10 rounded-full mr-3" style={{ backgroundColor: config?.primaryColor || '#7f651e' }}></div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#1a1a1a' }}>
              Imóveis Exclusivos
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Botões de navegação principais */}
            {properties.length > visibleProperties && (
              <div className="flex gap-2">
                <button 
                  onClick={goToPrevSlide}
                  className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={goToNextSlide}
                  className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Próximo slide"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
            
            {/* Indicadores de slides para telas maiores */}
            {maxSlides > 0 && (
              <div className="hidden md:flex space-x-1.5">
                {Array.from({ length: maxSlides + 1 }).map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 transition-all rounded-full ${
                      index === currentSlide ? 'w-8 bg-black' : 'w-3 bg-gray-300'
                    }`}
                    aria-label={`Ir para slide ${index + 1}`}
                    style={index === currentSlide ? { backgroundColor: primaryColor } : {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Carrossel com 4 cards por tela */}
        <div className="relative">
          <div className="overflow-hidden px-1 py-2">
            <div 
              ref={sliderRef}
              className="flex flex-nowrap gap-5 transition-transform duration-500 ease-out"
              style={{ 
                transform: `translateX(-${currentSlide * (100 / visibleProperties + (20 / visibleProperties))}%)`
              }}
            >
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  className="flex-shrink-0"
                  style={{ width: `${slideWidth}%` }}
                >
                  <PropertyCard 
                    property={property}
                    onClick={() => handlePropertyClick && handlePropertyClick(property.id)}
                    primaryColor={primaryColor}
                    buttonTextColor={buttonTextColor}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Botões de navegação para dispositivos móveis */}
          {properties.length > visibleProperties && (
            <>
              <button 
                onClick={goToPrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all z-10 md:hidden"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
              <button 
                onClick={goToNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all z-10 md:hidden"
                aria-label="Próximo slide"
              >
                <ChevronRight className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
            </>
          )}
        </div>
        
        {/* Indicadores de slides para dispositivos móveis */}
        {maxSlides > 0 && (
          <div className="flex justify-center mt-6 space-x-1.5 md:hidden">
            {Array.from({ length: maxSlides + 1 }).map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-gray-800' : 'bg-gray-300'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
                style={index === currentSlide ? { backgroundColor: primaryColor } : {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}