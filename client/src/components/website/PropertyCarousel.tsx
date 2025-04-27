import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WebsiteConfig, Property } from '@shared/schema';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faBath, faRulerCombined, faCar } from '@fortawesome/free-solid-svg-icons';
import PropertyDetailsModal from './PropertyDetailsModal';

interface PropertyCarouselProps {
  title?: string;
  properties?: Property[];
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ 
  title = "Imóveis em Destaque",
  properties: customProperties
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Estado para o modal de detalhes do imóvel
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: fetchedProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  // Usa as propriedades passadas por prop ou as buscadas pela API
  const properties = customProperties || fetchedProperties;
  
  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
  });
  
  const bgColor = config?.primaryColor || '#7f651e';
  
  // Função para abrir o modal de detalhes
  const openPropertyDetails = (id: number) => {
    setSelectedPropertyId(id);
    setIsModalOpen(true);
  };
  
  // Função para fechar o modal
  const closePropertyModal = () => {
    setIsModalOpen(false);
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  // Add CSS to hide scrollbar and add hover effects
  const customStyles = `
    .carousel-container::-webkit-scrollbar {
      display: none;
    }
    .carousel-container {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    /* Property card hover effects */
    .property-card:hover .eye-icon {
      opacity: 1;
    }
    
    .property-card:hover .property-image {
      transform: scale(1.05);
      transition: transform 0.5s ease;
    }
    
    .property-image {
      transition: transform 0.5s ease;
    }
  `;

  const [isDesktop, setIsDesktop] = useState(false);
  const totalItems = properties?.length || 0;
  const itemsPerPage = { mobile: 1, desktop: 4 };
  const maxIndexMobile = totalItems - itemsPerPage.mobile;
  const maxIndexDesktop = Math.max(0, totalItems - itemsPerPage.desktop);
  const maxScrollIndex = isDesktop ? maxIndexDesktop : maxIndexMobile;
  
  // Verificar tamanho da tela quando o componente montar
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    
    return () => {
      window.removeEventListener('resize', checkIfDesktop);
    };
  }, []);

  const scrollNext = () => {
    if (!carouselRef.current || !properties) return;
    
    if (currentIndex < maxScrollIndex) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      if (isDesktop) {
        // No desktop, cada card tem 25% da largura
        const containerWidth = carouselRef.current.offsetWidth;
        const scrollAmount = nextIndex * (containerWidth / 4);
        
        carouselRef.current.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      } else {
        // No mobile, scroll para o próximo item (100% da largura)
        carouselRef.current.scrollTo({
          left: nextIndex * carouselRef.current.offsetWidth,
          behavior: 'smooth'
        });
      }
    }
  };
  
  const scrollPrev = () => {
    if (!carouselRef.current || !properties) return;
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      
      if (isDesktop) {
        // No desktop, cada card tem 25% da largura
        const containerWidth = carouselRef.current.offsetWidth;
        const scrollAmount = prevIndex * (containerWidth / 4);
        
        carouselRef.current.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      } else {
        // No mobile, scroll para o item anterior (100% da largura)
        carouselRef.current.scrollTo({
          left: prevIndex * carouselRef.current.offsetWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      {/* Modal de detalhes do imóvel */}
      {isModalOpen && selectedPropertyId && (
        <PropertyDetailsModal
          isOpen={isModalOpen}
          onClose={closePropertyModal}
          propertyId={selectedPropertyId}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: bgColor }}>{title}</h2>
        
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            style={{ color: bgColor }}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={scrollNext}
            disabled={currentIndex >= maxScrollIndex}
            className={`p-2 rounded-full ${currentIndex >= maxScrollIndex ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            style={{ color: bgColor }}
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory carousel-container"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth'
        }}
      >
        {properties?.map((property, index) => (
          <div
            key={property.id}
            className="min-w-full md:min-w-[25%] w-full md:w-1/4 flex-shrink-0 snap-center px-1 md:px-2"
          >
            <div 
              className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer relative"
              onClick={() => openPropertyDetails(property.id)}>
              {/* Property Image */}
              <div className="property-image-container h-48 relative overflow-hidden">
                <img
                  src={property.images?.[0]?.url || '/placeholder-property.jpg'}
                  alt={property.title || 'Imóvel'}
                  className="property-image w-full h-full object-cover"
                />
                {/* Botão Ver Detalhes que aparece no hover */}
                <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                  <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                    <i className="fas fa-eye text-sm" style={{ color: bgColor }}></i>
                    <span className="text-sm font-medium" style={{ color: bgColor }}>Ver Detalhes</span>
                  </div>
                </div>
              </div>
              
              {/* Property Details */}
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2 truncate">{property.title || 'Imóvel sem título'}</h3>
                <p className="text-gray-600 text-sm mb-3 truncate">{property.neighborhood || property.city || property.address || 'Localização não informada'}</p>
                
                {/* Property Price */}
                <div className="text-lg font-bold mb-3" style={{ color: bgColor }}>
                  {formatPrice(property.price)}
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
    </div>
  );
};

export default PropertyCarousel;