import React, { useEffect, useState, useRef } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import './scrollbar.css';

interface PropertyDetailsModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailsModal({ propertyId, isOpen, onClose }: PropertyDetailsModalProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
        {/* Content */}
        {/* Close button */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 shadow-lg flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        <div className="p-6">
          {isLoadingProperty ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-[400px] bg-gray-200 rounded-xl mb-6"></div>
            </div>
          ) : currentProperty ? (
            <div className="grid grid-cols-1 gap-8">
              {/* Detalhes do imóvel */}
              <div className="col-span-1">
                {/* Main property image */}
                <div className="rounded-xl overflow-hidden relative mb-6 group">
                  <div 
                    className="relative rounded overflow-hidden"
                    style={{ aspectRatio: '16/9', maxHeight: '600px' }}
                  >
                    {activeImage ? (
                      <img 
                        src={activeImage} 
                        alt={currentProperty.title || "Imagem do imóvel"} 
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center center' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center bg-gray-200 w-full h-full">
                        <i className="ri-image-line text-4xl text-gray-400"></i>
                      </div>
                    )}
                    
                    {/* Image navigation controls */}
                    {currentProperty.images && currentProperty.images.length > 1 && (
                      <>
                        <button 
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            if (currentProperty.images && activeImage) {
                              const index = currentProperty.images.findIndex(img => {
                                if (typeof img === 'object' && img.url) return img.url === activeImage;
                                if (typeof img === 'string') return img === activeImage;
                                return false;
                              });
                              if (index > 0) {
                                const prevImg = currentProperty.images[index - 1];
                                let imgUrl = '';
                                
                                if (typeof prevImg === 'object' && prevImg.url) {
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            if (currentProperty.images && activeImage) {
                              const index = currentProperty.images.findIndex(img => {
                                if (typeof img === 'object' && img.url) return img.url === activeImage;
                                if (typeof img === 'string') return img === activeImage;
                                return false;
                              });
                              if (index < currentProperty.images.length - 1) {
                                const nextImg = currentProperty.images[index + 1];
                                let imgUrl = '';
                                
                                if (typeof nextImg === 'object' && nextImg.url) {
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
                </div>
                
                {/* Thumbnails */}
                {currentProperty.images && currentProperty.images.length > 1 && (
                  <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 scrollbar-hide">
                    {currentProperty.images.map((image, index) => {
                      const imageUrl = typeof image === 'object' && image.url 
                        ? image.url 
                        : typeof image === 'string' 
                          ? image 
                          : '';
                          
                      if (!imageUrl) return null;
                          
                      return (
                        <div 
                          key={index}
                          className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden cursor-pointer ${
                            activeImage === imageUrl ? 'ring-2 ring-offset-1 border-2' : ''
                          }`}
                          style={activeImage === imageUrl ? { borderColor: primaryColor } : {}}
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2" style={{ lineHeight: '2rem' }}>
                      {currentProperty.title}
                    </h1>
                    <div 
                      className="font-medium"
                      style={{ color: '#000000', fontSize: '22px', fontWeight: 500 }}
                    >
                      {formatCurrency(currentProperty.price)}
                      {currentProperty.purpose === 'rent' && 
                        <span className="text-base font-normal text-gray-500">/mês</span>
                      }
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4 text-gray-600">
                    <i className="ri-map-pin-line mr-2"></i>
                    <span>{currentProperty.address}</span>
                    <div className="ml-auto text-sm text-gray-600 flex items-center">
                      <i className="ri-code-line mr-1"></i>
                      <span>Cód. LL{currentProperty.id}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-gray-200 py-4 my-4">
                    <div className="flex flex-wrap gap-4 justify-between">
                      <div className="flex items-center">
                        <i className="fas fa-bed text-xl mr-2" style={{ color: primaryColor }}></i>
                        <div>
                          <span className="font-medium">{currentProperty.bedrooms || 0}</span>
                          <span className="text-gray-500 text-sm ml-1">Quartos</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-shower text-xl mr-2" style={{ color: primaryColor }}></i>
                        <div>
                          <span className="font-medium">{currentProperty.bathrooms || 0}</span>
                          <span className="text-gray-500 text-sm ml-1">Banheiros</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-bath text-xl mr-2" style={{ color: primaryColor }}></i>
                        <div>
                          <span className="font-medium">{currentProperty.suites || 0}</span>
                          <span className="text-gray-500 text-sm ml-1">Suítes</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-car text-xl mr-2" style={{ color: primaryColor }}></i>
                        <div>
                          <span className="font-medium">{currentProperty.parkingSpots || 0}</span>
                          <span className="text-gray-500 text-sm ml-1">Vagas</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-ruler-combined text-xl mr-2" style={{ color: primaryColor }}></i>
                        <div>
                          <span className="font-medium">{currentProperty.area}</span>
                          <span className="text-gray-500 text-sm ml-1">m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3">Descrição</h2>
                  <p className="text-gray-600 whitespace-pre-line">{currentProperty.description}</p>
                </div>
                
                {/* Características */}
                
                {currentProperty?.features && Array.isArray(currentProperty.features) && currentProperty.features.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-3">Características</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                      {currentProperty.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                            style={{ backgroundColor: `${primaryColor}15` }}>
                            <i 
                              className="fas fa-check text-sm"
                              style={{ color: primaryColor }}
                            ></i>
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Localização */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3">Localização</h2>
                  <div className="border border-gray-200 rounded-lg h-64 overflow-hidden">
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
                      <div className="h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <i className="ri-map-pin-line text-4xl mb-2 text-gray-400"></i>
                          <p className="text-gray-500">Mapa indisponível</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-8 flex flex-wrap gap-4 justify-end">
                  <Button
                    onClick={() => window.location.href = `/properties/${propertyId}`}
                  >
                    Ver página completa
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">Imóvel não encontrado</p>
            </div>
          )}
        </div>

        {/* Botão dentro do popup que vai de ponta a ponta */}
        {agent && (
          <div className="w-full mt-6 -mx-6 -mb-6">
            <div 
              className="flex items-center justify-center shadow-lg cursor-pointer px-4 py-4 md:py-3 w-full"
              style={{ 
                backgroundColor: '#25D366', 
                boxShadow: '0 -2px 8px rgba(0,0,0,0.05)' 
              }}
              onClick={() => {
                if (!agent || !currentProperty) return;
                const phone = agent.phone?.replace(/\D/g, '') || '';
                const message = `Olá, tenho interesse no imóvel "${currentProperty.title}" (Ref: ${currentProperty.id})`;
                const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              <div className="w-full flex items-center justify-between">
                <div className="hidden md:flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white mr-3 flex-shrink-0">
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
                  <div className="text-white text-left">
                    <p className="text-sm opacity-90">Corretor</p>
                    <p className="font-medium text-sm">{agent.displayName || "Corretor"}</p>
                  </div>
                </div>
                
                <div className="flex items-center mx-auto md:mx-0">
                  <span className="text-white font-bold tracking-wide text-base md:text-lg mr-3">FALAR COM CORRETOR</span>
                  <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                </div>
                
                <div className="hidden md:block">
                  <div className="text-white text-right">
                    <p className="text-sm opacity-90">Código do imóvel</p>
                    <p className="font-medium text-sm">#{currentProperty?.id || ""}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}