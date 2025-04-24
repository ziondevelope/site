import React, { useEffect, useState, useRef } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import './scrollbar.css';
import { useUI } from '@/contexts/UIContext';

interface PropertyDetailsModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailsModal({ propertyId, isOpen, onClose }: PropertyDetailsModalProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { setPropertyModalOpen } = useUI();
  
  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId && isOpen
  });
  
  // Fetch website config (for colors)
  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    enabled: isOpen
  });
  
  // Fetch agent data
  const { data: agent } = useQuery<any>({
    queryKey: [`/api/agents/${property?.agentId}`],
    enabled: !!property?.agentId && isOpen,
  });

  // Set the first image as active when property data is loaded
  useEffect(() => {
    if (property?.images && property.images.length > 0) {
      // Check if property has images and if they are objects with url
      if (typeof property.images[0] === 'object' && property.images[0].url) {
        const featuredImage = property.images.find(img => 
          typeof img === 'object' && 'isFeatured' in img && img.isFeatured
        );
        
        setActiveImage(
          featuredImage && 'url' in featuredImage 
            ? featuredImage.url 
            : property.images[0].url
        );
      } 
      // If array of strings
      else if (typeof property.images[0] === 'string') {
        setActiveImage(property.images[0]);
      }
    } else if (property?.featuredImage) {
      // Compatibility with older versions
      setActiveImage(property.featuredImage);
    }
  }, [property]);

  // Close on ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Add/remove overflow:hidden to body when modal opens/closes
  // and update global state for WhatsApp button visibility
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPropertyModalOpen(true);
    } else {
      document.body.style.overflow = '';
      setPropertyModalOpen(false);
    }
    return () => {
      document.body.style.overflow = '';
      setPropertyModalOpen(false);
    };
  }, [isOpen, setPropertyModalOpen]);

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Property current visual
  const currentProperty = property;
  const primaryColor = config?.primaryColor || 'var(--primary)';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div 
        ref={modalRef}
        className="bg-white w-full md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[45%] h-full overflow-y-auto mx-auto modal-custom-scrollbar"
        style={{ 
          scrollbarColor: '#9e9e9e #f1f1f1',
          scrollbarWidth: 'thin',
          '--primary': primaryColor
        } as React.CSSProperties}
      >
        {/* Imagem principal do imóvel - Estendida até as bordas */}
        <div className="relative w-full" style={{ aspectRatio: '16/9', maxHeight: '500px' }}>
          {activeImage ? (
            <img 
              src={activeImage} 
              alt={currentProperty?.title || "Imagem do imóvel"} 
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-200 w-full h-full">
              <i className="ri-image-line text-4xl text-gray-400"></i>
            </div>
          )}
          
          {/* Botão de fechar sobre a imagem */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 shadow-lg flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>
          
          {/* Controles de navegação das imagens */}
          {currentProperty?.images && currentProperty.images.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                onClick={() => {
                  if (currentProperty.images && activeImage) {
                    const index = currentProperty.images.findIndex(img => {
                      if (typeof img === 'object' && 'url' in img) return img.url === activeImage;
                      if (typeof img === 'string') return img === activeImage;
                      return false;
                    });
                    if (index > 0) {
                      const prevImg = currentProperty.images[index - 1];
                      let imgUrl = '';
                      
                      if (typeof prevImg === 'object' && 'url' in prevImg) {
                        imgUrl = prevImg.url;
                      } else if (typeof prevImg === 'string') {
                        imgUrl = prevImg;
                      }
                      
                      if (imgUrl) setActiveImage(imgUrl);
                    }
                  }
                }}
              >
                <i className="ri-arrow-left-s-line text-2xl text-gray-800"></i>
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100"
                onClick={() => {
                  if (currentProperty?.images && activeImage) {
                    const index = currentProperty.images.findIndex(img => {
                      if (typeof img === 'object' && 'url' in img) return img.url === activeImage;
                      if (typeof img === 'string') return img === activeImage;
                      return false;
                    });
                    if (index < currentProperty.images.length - 1) {
                      const nextImg = currentProperty.images[index + 1];
                      let imgUrl = '';
                      
                      if (typeof nextImg === 'object' && 'url' in nextImg) {
                        imgUrl = nextImg.url;
                      } else if (typeof nextImg === 'string') {
                        imgUrl = nextImg;
                      }
                      
                      if (imgUrl) setActiveImage(imgUrl);
                    }
                  }
                }}
              >
                <i className="ri-arrow-right-s-line text-2xl text-gray-800"></i>
              </button>
            </>
          )}
        </div>

        <div className="p-6 text-white" style={{ backgroundColor: primaryColor }}>
          {isLoadingProperty ? (
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-white/20 rounded w-1/2 mb-8"></div>
              <div className="h-[400px] bg-white/20 rounded-xl mb-6"></div>
            </div>
          ) : currentProperty ? (
            <div className="grid grid-cols-1 gap-8">
              {/* Detalhes do imóvel */}
              <div className="col-span-1">
                {/* Thumbnails */}
                {currentProperty.images && currentProperty.images.length > 1 && (
                  <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 scrollbar-hide">
                    {currentProperty.images.map((image, index) => {
                      const imageUrl = typeof image === 'object' && 'url' in image 
                        ? image.url 
                        : typeof image === 'string' 
                          ? image 
                          : '';
                          
                      if (!imageUrl) return null;
                          
                      return (
                        <div 
                          key={index}
                          className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden cursor-pointer ${
                            activeImage === imageUrl ? 'ring-2 ring-offset-1 border-2 border-white' : ''
                          }`}
                          style={activeImage === imageUrl ? { borderColor: 'white' } : {}}
                          onClick={() => setActiveImage(imageUrl)}
                        >
                          <div className="w-full h-full relative">
                            <img 
                              src={imageUrl} 
                              alt={`Imagem ${index + 1} do imóvel`}
                              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Title and price */}
                <div className="mb-6">
                  <div className="mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ lineHeight: '2rem' }}>
                      {currentProperty.title}
                    </h1>
                    <div 
                      className="font-medium"
                      style={{ color: 'white', fontSize: '22px', fontWeight: 500 }}
                    >
                      {formatCurrency(currentProperty.price)}
                      {currentProperty.purpose === 'rent' && 
                        <span className="text-base font-normal text-white/70">/mês</span>
                      }
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4 text-white/90">
                    <i className="ri-map-pin-line mr-2 text-white"></i>
                    <span>{currentProperty.address}</span>
                    <div className="ml-auto text-sm text-white/90 flex items-center">
                      <i className="ri-code-line mr-1 text-white"></i>
                      <span>Cód. LL{currentProperty.id}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-white/20 py-4 my-4">
                    <div className="flex flex-wrap gap-4 justify-between">
                      <div className="flex items-center">
                        <i className="fas fa-bed text-xl mr-2 text-white"></i>
                        <div>
                          <span className="font-medium text-white">{currentProperty.bedrooms || 0}</span>
                          <span className="text-white/70 text-sm ml-1">Quartos</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-shower text-xl mr-2 text-white"></i>
                        <div>
                          <span className="font-medium text-white">{currentProperty.bathrooms || 0}</span>
                          <span className="text-white/70 text-sm ml-1">Banheiros</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-bath text-xl mr-2 text-white"></i>
                        <div>
                          <span className="font-medium text-white">{currentProperty.suites || 0}</span>
                          <span className="text-white/70 text-sm ml-1">Suítes</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-car text-xl mr-2 text-white"></i>
                        <div>
                          <span className="font-medium text-white">{currentProperty.parkingSpots || 0}</span>
                          <span className="text-white/70 text-sm ml-1">Vagas</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-ruler-combined text-xl mr-2 text-white"></i>
                        <div>
                          <span className="font-medium text-white">{currentProperty.area}</span>
                          <span className="text-white/70 text-sm ml-1">m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 text-white">Descrição</h2>
                  <p className="text-white/90 whitespace-pre-line">{currentProperty.description}</p>
                </div>
                
                {/* Características */}
                {currentProperty.features && Array.isArray(currentProperty.features) && currentProperty.features.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-white">Características</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                      {currentProperty.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-white/20">
                            <i 
                              className="fas fa-check text-sm text-white"
                            ></i>
                          </div>
                          <span className="text-white">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Localização */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 text-white">Localização</h2>
                  <div className="border border-white/20 rounded-lg h-64 overflow-hidden">
                    {currentProperty.address ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        style={{ border: 0 }} 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          `${currentProperty.address}, ${currentProperty.neighborhood || ''}, ${currentProperty.city || ''}, ${currentProperty.zipCode || ''}`
                        )}&z=15&output=embed`}
                        allowFullScreen
                        title="Localização do imóvel"
                      ></iframe>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-white/10">
                        <div className="text-center">
                          <i className="ri-map-pin-line text-4xl mb-2 text-white/40"></i>
                          <p className="text-white/60">Mapa indisponível</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-white/70">Imóvel não encontrado</p>
            </div>
          )}
        </div>

        {/* Chat button fixo */}
        {agent && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div 
              className="flex items-center shadow-lg rounded-full cursor-pointer px-8 py-3 whitespace-nowrap"
              style={{ backgroundColor: '#25D366', minWidth: '260px' }}
              onClick={() => {
                if (!agent || !currentProperty) return;
                const phone = agent.phone?.replace(/\D/g, '') || '';
                const message = `Olá, tenho interesse no imóvel "${currentProperty.title}" (Ref: ${currentProperty.id})`;
                const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white mr-4 flex-shrink-0">
                {agent.avatar ? (
                  <img
                    src={agent.avatar}
                    alt={agent.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <i className="ri-user-line text-gray-400 text-xl"></i>
                  </div>
                )}
              </div>
              <span className="text-white font-medium flex-grow text-center">FALAR COM CORRETOR</span>
              <i className="fab fa-whatsapp text-white text-xl ml-4 flex-shrink-0"></i>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}