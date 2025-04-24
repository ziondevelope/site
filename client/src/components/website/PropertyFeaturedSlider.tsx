import React, { useState, useEffect } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

interface PropertyFeaturedSliderProps {
  openPropertyModal?: (propertyId: number) => void;
  properties?: Property[];
  config?: WebsiteConfig;
}

export default function PropertyFeaturedSlider({ 
  openPropertyModal, 
  properties: propProperties,
  config: propConfig 
}: PropertyFeaturedSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Obter configurações do site para cores (caso não tenha sido passado como prop)
  const { data: configData } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    enabled: !propConfig
  });
  
  // Use a configuração passada como propriedade ou a obtida pela consulta
  const config = propConfig || configData;
  
  // Se as propriedades não forem fornecidas, busque-as
  const { data: propertiesData, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !propProperties,
    select: (data) => {
      // Filtramos para pegar apenas propriedades destacadas e limitamos a 5
      const featured = data.filter(property => property.isFeatured);
      return featured.slice(0, 5);
    }
  });
  
  // Use as propriedades passadas como propriedade ou as obtidas pela consulta
  const properties = propProperties || propertiesData;
  
  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || !properties || properties.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(current => (current + 1) % (properties?.length || 1));
    }, 5000); // 5 segundos por slide
    
    return () => clearInterval(interval);
  }, [autoplay, properties]);
  
  // Pausa o autoplay quando o mouse está sobre o slider
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);
  
  // Navegação de slides
  const goToNextSlide = () => {
    if (!properties) return;
    setCurrentSlide((prevSlide) => (prevSlide + 1) % properties.length);
  };
  
  const goToPrevSlide = () => {
    if (!properties) return;
    setCurrentSlide((prevSlide) => (prevSlide - 1 + properties.length) % properties.length);
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

  const primaryColor = config?.primaryColor || '#7f651e';
  const currentProperty = properties[currentSlide];
  
  // Se não houver propriedades em destaque, não mostra o slider
  if (properties.length === 0) return null;
  
  return (
    <div 
      className="mx-auto py-10 relative bg-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: primaryColor }}>
            Imóveis Exclusivos
          </h2>
          
          <div className="flex space-x-2">
            {/* Indicadores de slides */}
            {properties.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-orange-500 w-6' : 'bg-gray-300'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
                style={index === currentSlide ? { backgroundColor: primaryColor } : {}}
              />
            ))}
          </div>
        </div>
        
        {/* Slider */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {properties.map((property, index) => (
              <div key={property.id} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                  {/* Imagem do imóvel (lado esquerdo) */}
                  <div className="relative h-64 md:h-[400px] overflow-hidden md:col-span-3">
                    <img 
                      src={property.featuredImage || (property.images && property.images.length > 0 
                        ? typeof property.images[0] === 'string' 
                          ? property.images[0] 
                          : property.images[0].url
                        : '')}
                      alt={property.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full h-1/3"></div>
                    <div className="absolute bottom-4 left-4">
                      <span 
                        className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Informações do imóvel (lado direito) */}
                  <div className="p-6 md:p-8 flex flex-col justify-center text-white h-full md:col-span-2" style={{ backgroundColor: primaryColor }}>
                    <div className="text-left w-full">
                      <h3 className="text-xl md:text-2xl font-bold mb-4 line-clamp-2 text-white">
                        {property.title}
                      </h3>
                      
                      <div className="mb-6">
                        <p className="text-white/80 mb-2 flex items-center text-sm">
                          <i className="ri-map-pin-line mr-2 text-white"></i>
                          {property.address || `${property.neighborhood}, ${property.city}`}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(property.price)}
                          {property.purpose === 'rent' && <span className="text-white/70 text-base font-normal">/mês</span>}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="flex items-center">
                          <i className="fas fa-bed text-xl mr-2 text-white"></i>
                          <div>
                            <span className="font-medium text-white">{property.bedrooms || 0}</span>
                            <span className="text-white/70 text-sm ml-1">Quartos</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <i className="fas fa-shower text-xl mr-2 text-white"></i>
                          <div>
                            <span className="font-medium text-white">{property.bathrooms || 0}</span>
                            <span className="text-white/70 text-sm ml-1">Banhos</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <i className="fas fa-ruler-combined text-xl mr-2 text-white"></i>
                          <div>
                            <span className="font-medium text-white">{property.area}</span>
                            <span className="text-white/70 text-sm ml-1">m²</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full">
                      <button
                        onClick={() => openPropertyModal && openPropertyModal(property.id)}
                        className="inline-block px-6 py-3 rounded-lg bg-white font-medium transition-all hover:shadow-lg w-full text-center"
                        style={{ color: primaryColor }}
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Botões de navegação */}
          {properties.length > 1 && (
            <>
              <button 
                onClick={goToPrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-80 shadow-md flex items-center justify-center hover:bg-opacity-100 transition-all z-10"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
              <button 
                onClick={goToNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-80 shadow-md flex items-center justify-center hover:bg-opacity-100 transition-all z-10"
                aria-label="Próximo slide"
              >
                <ChevronRight className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}