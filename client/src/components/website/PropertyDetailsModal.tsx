import React, { useEffect, useState, useRef } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import './scrollbar.css';
import { useUI } from '@/contexts/UIContext';
import { motion, useAnimation } from 'framer-motion';

interface PropertyDetailsModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
  config?: WebsiteConfig;
}

export default function PropertyDetailsModal({ propertyId, isOpen, onClose, config: propConfig }: PropertyDetailsModalProps) {
  // Usando uma chave única para forçar a remontagem completa do componente quando o modal fecha
  // Isso garante que todos os estados sejam resetados
  const [key, setKey] = useState(0);

  // Quando o modal é fechado e depois reaberto, forçamos a remontagem do componente
  useEffect(() => {
    if (!isOpen) {
      // Espera o modal fechar completamente para evitar flicker visual
      const timeout = setTimeout(() => {
        setKey(prevKey => prevKey + 1);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Retorno antecipado para forçar a remontagem quando o modal fecha
  if (!isOpen) return null;

  return (
    <PropertyDetailsContent 
      key={`property-modal-${key}-${propertyId}`}
      propertyId={propertyId}
      isOpen={isOpen}
      onClose={onClose}
      propConfig={propConfig}
    />
  );
}

// Componente interno que contém todo o conteúdo e lógica
function PropertyDetailsContent({ propertyId, isOpen, onClose, propConfig }: { 
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
  propConfig?: WebsiteConfig;
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { setPropertyModalOpen } = useUI();
  
  // Estados para controle de rolagem e animação do botão "Falar com corretor"
  const [showContactButton, setShowContactButton] = useState(false);
  const controls = useAnimation();
  
  // Limpa a imagem ativa quando muda de imóvel ou quando abre/fecha o modal
  useEffect(() => {
    // Limpa a imagem ativa ao abrir o modal com um novo propertyId ou ao fechar o modal
    setActiveImage(null);
  }, [propertyId, isOpen]);
  
  // Fetch property details
  const { data: property, isLoading: isLoadingProperty, refetch } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId && isOpen,
    refetchOnWindowFocus: false,
    staleTime: 0  // Força sempre buscar dados novos
  });
  
  // Quando o modal é aberto, forçar o refetch dos dados
  useEffect(() => {
    if (isOpen && propertyId) {
      refetch();
    }
  }, [isOpen, propertyId, refetch]);
  
  // Fetch website config (for colors) se não tiver sido passado como prop
  const { data: configData } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    enabled: isOpen && !propConfig
  });
  
  // Use a configuração passada como prop ou a obtida pela consulta
  const config = propConfig || configData;
  
  // Fetch agent data
  const { data: agent } = useQuery<any>({
    queryKey: [`/api/agents/${property?.agentId}`],
    enabled: !!property?.agentId && isOpen,
  });

  // Set the first image as active when property data is loaded or reloaded
  useEffect(() => {
    // Primeiro limpamos a imagem ativa para garantir que o estado está fresco
    setActiveImage(null);
    
    // Se ainda estiver carregando ou não tiver property, não faz nada
    if (isLoadingProperty || !property) return;
    
    console.log("Definindo imagem ativa para o imóvel:", property.id);
    
    // Pequeno atraso para garantir que o DOM foi atualizado
    const timer = setTimeout(() => {
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
    }, 50);
    
    return () => clearTimeout(timer);
  }, [property, isLoadingProperty]);

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
      
      // Resetar estado do botão quando o modal abre
      setShowContactButton(false);
    } else {
      document.body.style.overflow = '';
      setPropertyModalOpen(false);
    }
    return () => {
      document.body.style.overflow = '';
      setPropertyModalOpen(false);
    };
  }, [isOpen, setPropertyModalOpen]);
  
  // Detectar scroll do modal para mostrar/esconder o botão "Falar com corretor"
  useEffect(() => {
    if (!modalRef.current || !isOpen) return;
    
    // Sempre iniciar com o botão oculto quando abre o modal
    setShowContactButton(false);
    
    const handleScroll = () => {
      if (!modalRef.current) return;
      
      const scrollHeight = modalRef.current.scrollHeight;
      const scrollTop = modalRef.current.scrollTop;
      const clientHeight = modalRef.current.clientHeight;
      
      // Calcular a porcentagem de rolagem (75% = 0.75)
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage >= 0.75 && !showContactButton) {
        setShowContactButton(true);
      } else if (scrollPercentage < 0.75 && showContactButton) {
        setShowContactButton(false);
      }
    };
    
    const modalElement = modalRef.current;
    modalElement.addEventListener('scroll', handleScroll);
    
    // Pequeno atraso antes de verificar a posição inicial para garantir que o conteúdo tenha sido renderizado
    const initialCheckTimeout = setTimeout(() => {
      handleScroll();
    }, 300); // 300ms de atraso
    
    return () => {
      if (modalElement) {
        modalElement.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(initialCheckTimeout);
    };
  }, [showContactButton, isOpen]);

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
  
  // Cores personalizadas para o modal de detalhes
  const detailsBackgroundColor = config?.propertyDetailsBackgroundColor || primaryColor;
  const detailsTextColor = config?.propertyDetailsTextColor || '#ffffff';
  const detailsIconsColor = config?.propertyDetailsIconsColor || '#f0f0f0';

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

        <div className="p-6" style={{ backgroundColor: detailsBackgroundColor, color: detailsTextColor }}>
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
                    <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ lineHeight: '2rem', color: detailsTextColor }}>
                      {currentProperty.title}
                    </h1>
                    <div 
                      className="font-medium"
                      style={{ color: detailsTextColor, fontSize: '22px', fontWeight: 500 }}
                    >
                      {formatCurrency(currentProperty.price)}
                      {currentProperty.purpose === 'rent' && 
                        <span className="text-base font-normal" style={{ color: `${detailsTextColor}BB` }}>/mês</span>
                      }
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4" style={{ color: `${detailsTextColor}DD` }}>
                    <i className="ri-map-pin-line mr-2" style={{ color: detailsIconsColor }}></i>
                    <span>{currentProperty.address}</span>
                    <div className="ml-auto text-sm flex items-center" style={{ color: `${detailsTextColor}DD` }}>
                      <i className="ri-code-line mr-1" style={{ color: detailsIconsColor }}></i>
                      <span>Cód. LL{currentProperty.id}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-b py-4 my-4" style={{ borderColor: `${detailsTextColor}22` }}>
                    <div className="flex flex-wrap gap-4 justify-between">
                      <div className="flex items-center">
                        <i className="fas fa-bed text-xl mr-2" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <span className="font-medium" style={{ color: detailsTextColor }}>{currentProperty.bedrooms || 0}</span>
                          <span className="text-sm ml-1" style={{ color: `${detailsTextColor}BB` }}>Quartos</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-shower text-xl mr-2" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <span className="font-medium" style={{ color: detailsTextColor }}>{currentProperty.bathrooms || 0}</span>
                          <span className="text-sm ml-1" style={{ color: `${detailsTextColor}BB` }}>Banheiros</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-bath text-xl mr-2" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <span className="font-medium" style={{ color: detailsTextColor }}>{currentProperty.suites || 0}</span>
                          <span className="text-sm ml-1" style={{ color: `${detailsTextColor}BB` }}>Suítes</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-car text-xl mr-2" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <span className="font-medium" style={{ color: detailsTextColor }}>{currentProperty.parkingSpots || 0}</span>
                          <span className="text-sm ml-1" style={{ color: `${detailsTextColor}BB` }}>Vagas</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="fas fa-ruler-combined text-xl mr-2" style={{ color: detailsIconsColor }}></i>
                        <div>
                          <span className="font-medium" style={{ color: detailsTextColor }}>{currentProperty.area}</span>
                          <span className="text-sm ml-1" style={{ color: `${detailsTextColor}BB` }}>m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3" style={{ color: detailsTextColor }}>Descrição</h2>
                  <p className="whitespace-pre-line" style={{ color: `${detailsTextColor}EE` }}>{currentProperty.description}</p>
                </div>
                
                {/* Características */}
                {currentProperty.features && Array.isArray(currentProperty.features) && currentProperty.features.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-3" style={{ color: detailsTextColor }}>Características</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                      {currentProperty.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                               style={{ backgroundColor: `${detailsIconsColor}20` }}>
                            <i 
                              className="fas fa-check text-sm"
                              style={{ color: detailsIconsColor }}
                            ></i>
                          </div>
                          <span style={{ color: detailsTextColor }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Localização */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3" style={{ color: detailsTextColor }}>Localização</h2>
                  <div className="border rounded-lg h-64 overflow-hidden" style={{ borderColor: `${detailsTextColor}22` }}>
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
                      <div className="h-full flex items-center justify-center" style={{ backgroundColor: `${detailsIconsColor}15` }}>
                        <div className="text-center">
                          <i className="ri-map-pin-line text-4xl mb-2" style={{ color: `${detailsIconsColor}66` }}></i>
                          <p style={{ color: `${detailsTextColor}99` }}>Mapa indisponível</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Botão Falar com corretor abaixo do mapa */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        // Abrir WhatsApp com mensagem personalizada
                        if (agent) {
                          const phone = agent.phone?.replace(/\D/g, '') || '';
                          const message = `Olá, tenho interesse no imóvel "${currentProperty.title}" (Ref: ${currentProperty.id})`;
                          window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
                        } else if (config?.whatsappNumber) {
                          const phone = config.whatsappNumber.replace(/\D/g, '');
                          const message = `Olá! Estou interessado no imóvel ${currentProperty.title} (Cód. LL${currentProperty.id})`;
                          window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
                        }
                      }}
                      className="w-full py-3 px-4 bg-[#25D366] text-white rounded-lg font-medium flex items-center justify-center hover:bg-[#22c55e] transition-colors shadow-lg group relative overflow-hidden"
                      style={{ minHeight: "64px" }}
                    >
                      {agent && (
                        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-2 transition-transform group-hover:scale-110">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            {agent.avatar ? (
                              <img
                                src={agent.avatar}
                                alt={agent.name || "Corretor"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#1da851] flex items-center justify-center">
                                <i className="ri-user-line text-white text-xl"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col items-start justify-center absolute left-16">
                        <span className="text-white font-bold text-base mb-0.5">Falar com {agent?.name ? `${agent.name.split(' ')[0]}` : 'Corretor'}</span>
                        <span className="text-white/90 text-xs font-normal">Resposta rápida via WhatsApp</span>
                      </div>
                      <div className="absolute right-4 w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                        <i className="fab fa-whatsapp text-white text-xl"></i>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Botões de compartilhamento */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3" style={{ color: detailsTextColor }}>Compartilhar</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${detailsIconsColor}20`, color: detailsIconsColor }}
                      aria-label="Compartilhar no Facebook"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </button>
                    
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        const text = `Confira este imóvel: ${currentProperty.title}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${detailsIconsColor}20`, color: detailsIconsColor }}
                      aria-label="Compartilhar no Twitter"
                    >
                      <i className="fab fa-twitter"></i>
                    </button>
                    
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        window.open(`https://wa.me/?text=${encodeURIComponent(`Confira este imóvel: ${currentProperty.title} ${url}`)}`, '_blank');
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${detailsIconsColor}20`, color: detailsIconsColor }}
                      aria-label="Compartilhar no WhatsApp"
                    >
                      <i className="fab fa-whatsapp"></i>
                    </button>
                    
                    <button
                      onClick={() => {
                        // Copiar link para o clipboard
                        const url = window.location.href;
                        navigator.clipboard.writeText(url).then(() => {
                          alert('Link copiado!');
                        });
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${detailsIconsColor}20`, color: detailsIconsColor }}
                      aria-label="Copiar link"
                    >
                      <i className="fas fa-link"></i>
                    </button>
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

        {/* Botão WhatsApp que aparece após 75% de rolagem */}
        {showContactButton && agent && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999]">
            <button 
              className="flex items-center shadow-lg rounded-full cursor-pointer px-8 py-3 whitespace-nowrap animate-fadeIn"
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
            </button>
          </div>
        )}
      </div>
    </div>
  );
}