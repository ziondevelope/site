import React, { useEffect, useState, useRef } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
        className="bg-white w-full h-full overflow-y-auto"
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 shadow-lg flex items-center justify-center transition-all"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* Content */}
        <div className="p-6">
          {isLoadingProperty ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-[400px] bg-gray-200 rounded-xl mb-6"></div>
            </div>
          ) : currentProperty ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Coluna esquerda - Cartão de contato do corretor */}
              <div className="md:col-span-1 order-2 md:order-1">
                {agent && (
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <div className="p-6 flex flex-col items-center text-center">
                      {/* Avatar */}
                      {agent.avatar ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md mb-4">
                          <img
                            src={agent.avatar}
                            alt={agent.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                          <i className="ri-user-line text-gray-400 text-4xl"></i>
                        </div>
                      )}
                      
                      {/* Nome e CRECI */}
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{agent.displayName}</h3>
                      <p className="text-gray-500 mb-6">CRECI {agent.creci || '111111'}</p>
                      
                      {/* Botões de ação */}
                      <div className="w-full space-y-3">
                        <Button 
                          className="w-full bg-white border-gray-300 hover:bg-gray-50 text-gray-800" 
                          variant="outline"
                        >
                          FALE COM O CORRETOR
                        </Button>
                        
                        <Button 
                          className="w-full bg-white border-gray-300 hover:bg-gray-50 text-gray-800" 
                          variant="outline"
                        >
                          AGENDAR UMA VISITA
                        </Button>
                        
                        <Button 
                          className="w-full"
                          style={{ backgroundColor: primaryColor }}
                        >
                          ENTRAR EM CONTATO
                        </Button>
                      </div>
                      
                      {/* Compartilhar */}
                      <div className="mt-6 w-full">
                        <p className="text-center text-gray-500 mb-3 text-xs uppercase tracking-wider">COMPARTILHAR</p>
                        <div className="flex justify-center space-x-2">
                          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                            <i className="fab fa-whatsapp"></i>
                          </button>
                          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                            <i className="fab fa-facebook-f"></i>
                          </button>
                          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                            <i className="fab fa-twitter"></i>
                          </button>
                          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                            <i className="far fa-envelope"></i>
                          </button>
                          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                            <i className="fas fa-print"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Coluna direita - Detalhes do imóvel */}
              <div className="md:col-span-2 order-1 md:order-2">
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
                            activeImage === imageUrl ? 'ring-2 ring-offset-1 ring-primary' : ''
                          }`}
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
                  <div className="flex flex-wrap items-center justify-between mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mr-4">
                      {currentProperty.title}
                    </h1>
                    <div 
                      className="text-2xl md:text-3xl font-bold mt-3 md:mt-0"
                      style={{ color: primaryColor }}
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
      </div>
    </div>
  );
}