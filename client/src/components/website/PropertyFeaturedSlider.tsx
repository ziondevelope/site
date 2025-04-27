import React, { useState, useEffect } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Componente de cartão de propriedade
const PropertyCard = ({ 
  property, 
  handlePropertyClick, 
  primaryColor, 
  textColor, 
  formatCurrency 
}: {
  property: Property;
  handlePropertyClick?: (id: number) => void;
  primaryColor: string;
  textColor: string;
  formatCurrency: (value: number) => string;
}) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">
      {/* Imagem do imóvel */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img 
          src={property.featuredImage || (property.images && property.images.length > 0 
            ? typeof property.images[0] === 'string' 
              ? property.images[0] 
              : property.images[0].url
            : '')}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent"></div>
        
        <div className="absolute top-3 left-3">
          <span 
            className="inline-block px-3 py-1 text-xs font-medium rounded-md text-white backdrop-blur-sm"
            style={{ backgroundColor: `${primaryColor}CC` }}
          >
            {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
          </span>
        </div>
      </div>
      
      {/* Conteúdo do imóvel */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-800">
          {property.title}
        </h3>
        
        <p className="mb-2 flex items-center text-xs text-gray-500">
          <i className="ri-map-pin-line mr-1 text-gray-600"></i>
          {property.address || `${property.neighborhood || ''}, ${property.city || ''}`}
        </p>
        
        <p className="text-xl font-bold tracking-tight text-gray-900 mb-3">
          {formatCurrency(property.price)}
          {property.purpose === 'rent' && <span className="text-sm font-normal text-gray-600">/mês</span>}
        </p>
        
        <div className="flex justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <i className="fas fa-bed mr-1"></i>
            <span>{property.bedrooms || 0}</span>
          </div>
          
          <div className="flex items-center">
            <i className="fas fa-shower mr-1"></i>
            <span>{property.bathrooms || 0}</span>
          </div>
          
          <div className="flex items-center">
            <i className="fas fa-ruler-combined mr-1"></i>
            <span>{property.area} m²</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <button
            onClick={() => handlePropertyClick && handlePropertyClick(property.id)}
            className="w-full px-4 py-2.5 rounded-lg font-medium text-center transition-all group-hover:shadow-md flex items-center justify-center"
            style={{ backgroundColor: primaryColor, color: textColor }}
          >
            <span>Ver Detalhes</span>
            <i className="ri-arrow-right-line ml-2 transition-transform group-hover:translate-x-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

interface PropertyFeaturedSliderProps {
  openPropertyModal?: (propertyId: number) => void;
  onPropertyClick?: (propertyId: number) => void;
  properties?: Property[];
  config?: WebsiteConfig;
}

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
  
  // Obter configurações do site para cores (mesmo que tenha sido passado como prop)
  // Isso garante que sempre teremos os dados mais recentes
  const { data: configData } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    refetchOnWindowFocus: true, // Recarrega quando o usuário volta para a janela
    refetchInterval: 3000, // Recarrega a cada 3 segundos
    staleTime: 0 // Considera os dados obsoletos imediatamente
  });
  
  // Use sempre os dados mais recentes
  const config = configData || propConfig;
  
  // Define as cores do slider com base nas configurações
  const [primaryColor, setPrimaryColor] = useState(config?.featuredSliderBackgroundColor || config?.primaryColor || '#7f651e');
  const [textColor, setTextColor] = useState(config?.featuredSliderTextColor || '#ffffff');
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
      setTextColor(config.featuredSliderTextColor || '#ffffff');
      setButtonTextColor(config.featuredSliderButtonTextColor || config.primaryColor || '#7f651e');
    }
  }, [config, config?.featuredSliderBackgroundColor, config?.featuredSliderTextColor, config?.featuredSliderButtonTextColor]);
  
  // Se as propriedades não forem fornecidas, busque-as
  const { data: propertiesData, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !propProperties,
    select: (data) => {
      // Filtramos para pegar apenas propriedades destacadas e limitamos a 5
      const featured = data.filter(property => property.isFeatured);
      return featured.slice(0, 6); // Aumentamos para 6 para ter 3 slides com 2 propriedades cada
    }
  });
  
  // Use as propriedades passadas como propriedade ou as obtidas pela consulta
  const properties = propProperties || propertiesData;
  
  // Calcula o número total de slides baseado em 2 propriedades por slide
  const totalSlides = properties ? Math.ceil(properties.length / 2) : 0;
  
  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || !properties || totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(current => (current + 1) % totalSlides);
    }, 5000); // 5 segundos por slide
    
    return () => clearInterval(interval);
  }, [autoplay, properties, totalSlides]);
  
  // Pausa o autoplay quando o mouse está sobre o slider
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);
  
  // Navegação de slides
  const goToNextSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };
  
  const goToPrevSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (isLoading || !properties || properties.length === 0) {
    return null;
  }
  
  // Se não houver propriedades em destaque, não mostra o slider
  if (properties.length === 0) return null;
  
  // Cria pares de imóveis (2 por slide)
  const propertyPairs = [];
  for (let i = 0; i < properties.length; i += 2) {
    const pair = [
      properties[i],
      i + 1 < properties.length ? properties[i + 1] : null
    ];
    propertyPairs.push(pair);
  }
  
  return (
    <div 
      className="mx-auto py-16 relative bg-gradient-to-b from-white to-gray-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto px-4 md:px-8">
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
            {totalSlides > 1 && (
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
            
            <div className="hidden md:flex space-x-1.5">
              {/* Indicadores de slides */}
              {Array.from({ length: totalSlides }).map((_, index) => (
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
          </div>
        </div>
        
        {/* Novo design do Slider com 2 imóveis por slide */}
        <div className="relative">
          <div className="overflow-hidden rounded-xl shadow-lg">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slides com 2 imóveis cada */}
              {propertyPairs.map((pair, pairIndex) => (
                <div key={`pair-${pairIndex}`} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {/* Primeiro imóvel do par */}
                    {pair[0] && (
                      <PropertyCard 
                        property={pair[0]} 
                        handlePropertyClick={handlePropertyClick}
                        primaryColor={primaryColor}
                        textColor={textColor}
                        formatCurrency={formatCurrency}
                      />
                    )}
                    
                    {/* Segundo imóvel do par (se existir) */}
                    {pair[1] && (
                      <PropertyCard 
                        property={pair[1]} 
                        handlePropertyClick={handlePropertyClick}
                        primaryColor={primaryColor}
                        textColor={textColor}
                        formatCurrency={formatCurrency}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botões de navegação laterais para mobile */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={goToPrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-all z-10 opacity-80 hover:opacity-100 md:hidden"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
              <button 
                onClick={goToNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-all z-10 opacity-80 hover:opacity-100 md:hidden"
                aria-label="Próximo slide"
              >
                <ChevronRight className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
            </>
          )}
        </div>
        
        {/* Indicadores para mobile */}
        <div className="mt-4 flex justify-center space-x-1.5 md:hidden">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-gray-800' : 'bg-gray-300'
              }`}
              aria-label={`Ir para slide ${idx + 1}`}
              style={idx === currentSlide ? { backgroundColor: primaryColor } : {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}