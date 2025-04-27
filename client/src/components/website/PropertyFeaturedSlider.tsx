import React, { useState, useEffect } from 'react';
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

  const currentProperty = properties[currentSlide];
  
  // Se não houver propriedades em destaque, não mostra o slider
  if (properties.length === 0) return null;
  
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
            {properties.length > 1 && (
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
              {properties.map((_, index) => (
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
        
        {/* Novo design do Slider */}
        <div className="relative">
          <div className="overflow-hidden rounded-xl shadow-xl">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {properties.map((property, index) => (
                <div key={property.id} className="w-full flex-shrink-0 group">
                  <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                    {/* Imagem do imóvel (lado esquerdo) */}
                    <div className="relative h-64 md:h-[450px] overflow-hidden md:col-span-7">
                      <img 
                        src={property.featuredImage || (property.images && property.images.length > 0 
                          ? typeof property.images[0] === 'string' 
                            ? property.images[0] 
                            : property.images[0].url
                          : '')}
                        alt={property.title}
                        loading="lazy"
                        fetchpriority="high"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:bg-gradient-to-r md:from-black/30 md:via-transparent md:to-transparent"></div>
                      
                      {/* Mobile indicators visible only on small screens */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 md:hidden">
                        {properties.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentSlide ? 'bg-white' : 'bg-white/50'
                            }`}
                            aria-label={`Ir para slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                      
                      <div className="absolute top-4 left-4">
                        <span 
                          className="inline-block px-3 py-1 text-sm font-medium rounded-md text-white backdrop-blur-sm"
                          style={{ backgroundColor: `${primaryColor}CC` }}
                        >
                          {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Informações do imóvel (lado direito) */}
                    <div className="p-6 md:p-8 flex flex-col justify-center h-full md:col-span-5 relative overflow-hidden"
                        style={{ backgroundColor: primaryColor, color: textColor }}>
                      {/* Elemento decorativo */}
                      <div className="hidden md:block absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 bg-white"></div>
                      <div className="hidden md:block absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-10 bg-black"></div>
                      
                      <div className="text-left w-full relative z-10">
                        <h3 className="text-xl md:text-2xl font-bold mb-3 line-clamp-2" style={{ color: textColor }}>
                          {property.title}
                        </h3>
                        
                        <div className="mb-6">
                          <p className="mb-2 flex items-center text-sm" style={{ color: `${textColor}cc` }}>
                            <i className="ri-map-pin-line mr-2" style={{ color: textColor }}></i>
                            {property.address || `${property.neighborhood}, ${property.city}`}
                          </p>
                          <p className="text-2xl font-bold tracking-tight" style={{ color: textColor }}>
                            {formatCurrency(property.price)}
                            {property.purpose === 'rent' && 
                              <span className="text-base font-normal ml-1" style={{ color: `${textColor}b3` }}>/mês</span>
                            }
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-5 mb-8">
                          <div className="flex items-center">
                            <i className="fas fa-bed text-xl mr-2" style={{ color: textColor }}></i>
                            <div>
                              <span className="font-medium" style={{ color: textColor }}>{property.bedrooms || 0}</span>
                              <span className="text-sm ml-1" style={{ color: `${textColor}b3` }}>Quartos</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <i className="fas fa-shower text-xl mr-2" style={{ color: textColor }}></i>
                            <div>
                              <span className="font-medium" style={{ color: textColor }}>{property.bathrooms || 0}</span>
                              <span className="text-sm ml-1" style={{ color: `${textColor}b3` }}>Banhos</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <i className="fas fa-ruler-combined text-xl mr-2" style={{ color: textColor }}></i>
                            <div>
                              <span className="font-medium" style={{ color: textColor }}>{property.area}</span>
                              <span className="text-sm ml-1" style={{ color: `${textColor}b3` }}>m²</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full relative z-10">
                        <button
                          onClick={() => handlePropertyClick && handlePropertyClick(property.id)}
                          className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white font-medium transition-all hover:shadow-lg w-full text-center group-hover:shadow-md"
                          style={{ color: buttonTextColor }}
                        >
                          <span>Ver Detalhes</span>
                          <i className="ri-arrow-right-line ml-2 transition-transform group-hover:translate-x-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botões de navegação laterais sobrepostos na imagem */}
          {properties.length > 1 && (
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
      </div>
    </div>
  );
}