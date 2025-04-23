import React, { useState, useEffect } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

export default function PropertyFeaturedSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Obter configurações do site para cores
  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config']
  });
  
  // Obter propriedades para o slider
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    select: (data) => {
      // Filtramos para pegar apenas propriedades destacadas e limitamos a 5
      const featured = data.filter(property => property.isFeatured);
      return featured.slice(0, 5);
    }
  });
  
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
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  {/* Imagem do imóvel (lado esquerdo) */}
                  <div className="relative h-64 md:h-[400px] overflow-hidden">
                    <img 
                      src={property.featuredImage || (property.images && property.images.length > 0 
                        ? typeof property.images[0] === 'string' 
                          ? property.images[0] 
                          : property.images[0].url
                        : '')}
                      alt={property.title}
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
                  <div className="p-6 md:p-8 flex flex-col justify-between bg-white">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <div className="mb-4">
                        <p className="text-gray-600 mb-1 flex items-center text-sm">
                          <i className="ri-map-pin-line mr-2"></i>
                          {property.address || `${property.neighborhood}, ${property.city}`}
                        </p>
                        <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                          {formatCurrency(property.price)}
                          {property.purpose === 'rent' && <span className="text-gray-500 text-base font-normal">/mês</span>}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center">
                          <i className="fas fa-bed text-xl mr-2" style={{ color: primaryColor }}></i>
                          <div>
                            <span className="font-medium">{property.bedrooms || 0}</span>
                            <span className="text-gray-500 text-sm ml-1">Quartos</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <i className="fas fa-shower text-xl mr-2" style={{ color: primaryColor }}></i>
                          <div>
                            <span className="font-medium">{property.bathrooms || 0}</span>
                            <span className="text-gray-500 text-sm ml-1">Banhos</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <i className="fas fa-ruler-combined text-xl mr-2" style={{ color: primaryColor }}></i>
                          <div>
                            <span className="font-medium">{property.area}</span>
                            <span className="text-gray-500 text-sm ml-1">m²</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Link to={`/properties/${property.id}`}>
                        <span 
                          className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg w-full text-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Ver Detalhes
                        </span>
                      </Link>
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