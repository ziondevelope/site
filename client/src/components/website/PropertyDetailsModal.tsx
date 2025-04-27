import React, { useEffect, useState, useRef, TouchEvent } from 'react';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import './scrollbar.css';
import './image-swipe.css';
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
  
  // Referências para controlar eventos de toque
  const touchStartXRef = useRef<number | null>(null);
  const touchingRef = useRef<boolean>(false);
  
  // Estados para controle de rolagem e animação do botão "Falar com corretor"
  const [showContactButton, setShowContactButton] = useState(false);
  const controls = useAnimation();
  
  // Fetch property details
  const { data: property, isLoading: isLoadingProperty, refetch } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId && isOpen,
    refetchOnWindowFocus: false,
    staleTime: 0  // Força sempre buscar dados novos
  });
  
  // Limpa a imagem ativa quando muda de imóvel ou quando abre/fecha o modal
  useEffect(() => {
    // Limpa a imagem ativa ao abrir o modal com um novo propertyId ou ao fechar o modal
    setActiveImage(null);
  }, [propertyId, isOpen]);
  
  // Função para navegação com teclas de seta
  useEffect(() => {
    // Função para lidar com a navegação de imagens via teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!property?.images || !activeImage) return;
      
      const index = property.images.findIndex(img => {
        if (typeof img === 'object' && 'url' in img) return img.url === activeImage;
        if (typeof img === 'string') return img === activeImage;
        return false;
      });
      
      // Tecla seta para a direita (próxima imagem)
      if (e.key === 'ArrowRight' && index < property.images.length - 1) {
        const nextImg = property.images[index + 1];
        let imgUrl = '';
        
        if (typeof nextImg === 'object' && 'url' in nextImg) {
          imgUrl = nextImg.url;
        } else if (typeof nextImg === 'string') {
          imgUrl = nextImg;
        }
        
        if (imgUrl) setActiveImage(imgUrl);
      } 
      // Tecla seta para a esquerda (imagem anterior)
      else if (e.key === 'ArrowLeft' && index > 0) {
        const prevImg = property.images[index - 1];
        let imgUrl = '';
        
        if (typeof prevImg === 'object' && 'url' in prevImg) {
          imgUrl = prevImg.url;
        } else if (typeof prevImg === 'string') {
          imgUrl = prevImg;
        }
        
        if (imgUrl) setActiveImage(imgUrl);
      }
    };
    
    // Adicionar o event listener apenas quando o modal estiver aberto
    if (isOpen && property) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [property, isOpen, activeImage]);
  
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
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/50">
      <div 
        ref={modalRef}
        className="bg-white w-full md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[45%] h-full overflow-y-auto mx-auto modal-custom-scrollbar"
        style={{ 
          scrollbarColor: '#9e9e9e #f1f1f1',
          scrollbarWidth: 'thin',
          '--primary': primaryColor
        } as React.CSSProperties}
      >
        {/* Imagem principal do imóvel - Estendida até as bordas, com suporte a toque/arraste */}
        <div className="relative w-full" style={{ aspectRatio: '16/9', maxHeight: '500px' }}>
          {activeImage ? (
            <div 
              className="w-full h-full touch-pan-y"
              onTouchStart={(e: React.TouchEvent) => {
                // Armazenar a posição inicial do toque na referência
                touchStartXRef.current = e.touches[0].clientX;
                touchingRef.current = true;
              }}
              onTouchMove={(e: React.TouchEvent) => {
                if (!touchingRef.current) return;
                // Evitamos o comportamento padrão do scroll apenas se for horizontal
                const currentX = e.touches[0].clientX;
                const startX = touchStartXRef.current || 0;
                const diffX = Math.abs(currentX - startX);
                
                if (diffX > 10) {
                  e.preventDefault();
                }
              }}
              onTouchEnd={(e: React.TouchEvent) => {
                if (!touchingRef.current || touchStartXRef.current === null || !property?.images) return;
                
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartXRef.current - touchEndX;
                
                // Se o movimento for significativo (mais de 50px)
                if (Math.abs(diff) > 50) {
                  const index = property.images.findIndex(img => {
                    if (typeof img === 'object' && 'url' in img) return img.url === activeImage;
                    if (typeof img === 'string') return img === activeImage;
                    return false;
                  });
                  
                  // Deslizar para a direita (próxima imagem)
                  if (diff > 0 && index < property.images.length - 1) {
                    const nextImg = property.images[index + 1];
                    let imgUrl = '';
                    
                    if (typeof nextImg === 'object' && 'url' in nextImg) {
                      imgUrl = nextImg.url;
                    } else if (typeof nextImg === 'string') {
                      imgUrl = nextImg;
                    }
                    
                    if (imgUrl) setActiveImage(imgUrl);
                  } 
                  // Deslizar para a esquerda (imagem anterior)
                  else if (diff < 0 && index > 0) {
                    const prevImg = property.images[index - 1];
                    let imgUrl = '';
                    
                    if (typeof prevImg === 'object' && 'url' in prevImg) {
                      imgUrl = prevImg.url;
                    } else if (typeof prevImg === 'string') {
                      imgUrl = prevImg;
                    }
                    
                    if (imgUrl) setActiveImage(imgUrl);
                  }
                }
                
                // Resetar o estado de toque
                touchStartXRef.current = null;
                touchingRef.current = false;
              }}
            >
              <img 
                src={activeImage} 
                alt={currentProperty?.title || "Imagem do imóvel"} 
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
                draggable="false" 
              />
            </div>
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
                    <div className="mb-2">
                      <div 
                        className="font-medium"
                        style={{ color: detailsTextColor, fontSize: '22px', fontWeight: 500 }}
                      >
                        {formatCurrency(currentProperty.price)}
                        {currentProperty.purpose === 'rent' && 
                          <span className="text-base font-normal" style={{ color: `${detailsTextColor}BB` }}>/mês</span>
                        }
                      </div>
                      
                      {/* Localização logo abaixo do preço principal */}
                      <div className="flex items-center mt-1 mb-2" style={{ color: `${detailsTextColor}DD` }}>
                        <i className="ri-map-pin-line mr-2" style={{ color: detailsIconsColor }}></i>
                        <span>{currentProperty.neighborhood || ''}{currentProperty.neighborhood && currentProperty.city ? ', ' : ''}{currentProperty.city || ''}</span>
                        <div className="ml-auto text-sm flex items-center" style={{ color: `${detailsTextColor}DD` }}>
                          <i className="ri-code-line mr-1" style={{ color: detailsIconsColor }}></i>
                          <span>Cód. LL{currentProperty.id}</span>
                        </div>
                      </div>
                      
                      {/* Seção de parcelas removida */}
                      

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
                
                {/* Formulário de contato - Movido para antes da localização */}
                <div className="mb-8">
                  <div className="p-6 rounded-lg shadow-sm border overflow-hidden" 
                      style={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#e5e7eb'
                      }}>
                    
                    {/* Cabeçalho do formulário */}
                    <div className="mb-5 relative">
                      {/* Título do formulário */}
                      <h3 className="text-lg font-semibold mb-4" style={{ color: detailsTextColor }}>
                        Agende uma visita
                      </h3>
                      
                      {/* Detalhes do corretor */}
                      {agent && (
                        <div className="mb-5 flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-3 shadow-sm flex-shrink-0">
                            {agent.avatar ? (
                              <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <i className="fas fa-user text-gray-400"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: detailsTextColor }}>
                              {agent.name || 'Corretor Especializado'}
                            </p>
                            <p className="text-xs" style={{ color: `${detailsTextColor}99` }}>
                              {agent.role === 'admin' ? 'Corretor(a) Chefe' : 'Corretor(a) Especializado(a)'} • CRECI: {agent.creci || 'Consulte'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Informações do imóvel no formulário de contato */}
                      <div className="mb-5 pb-4 border-b border-gray-100">
                        <div className="mb-1">
                          <span className="block text-xs uppercase font-medium text-gray-500 mb-1">Valor do Imóvel</span>
                          <div className="font-medium text-lg" style={{ color: detailsTextColor }}>
                            {formatCurrency(currentProperty.price)}
                            {currentProperty.purpose === 'rent' && 
                              <span className="text-base font-normal" style={{ color: `${detailsTextColor}BB` }}>/mês</span>
                            }
                          </div>
                        </div>
                        
                        {/* Seção de parcelas foi removida conforme solicitado */}
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {/* IPTU */}
                          {currentProperty.iptuValue ? (
                            <div className="text-sm" style={{ color: `${detailsTextColor}AA` }}>
                              <span className="block text-xs uppercase font-medium text-gray-500 mb-1">IPTU</span>
                              <span className="font-medium" style={{ color: detailsTextColor }}>{formatCurrency(currentProperty.iptuValue)}/ano</span>
                            </div>
                          ) : null}
                          
                          {/* Condomínio */}
                          {currentProperty.condoFee ? (
                            <div className="text-sm" style={{ color: `${detailsTextColor}AA` }}>
                              <span className="block text-xs uppercase font-medium text-gray-500 mb-1">Condomínio</span>
                              <span className="font-medium" style={{ color: detailsTextColor }}>{formatCurrency(currentProperty.condoFee)}/mês</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        
                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        const name = formData.get('name') as string;
                        const email = formData.get('email') as string;
                        const phone = formData.get('phone') as string;
                        const message = formData.get('message') as string;
                        
                        // Coletar preferências de contato
                        const preferWhatsapp = document.getElementById('prefer-whatsapp') as HTMLInputElement;
                        const preferEmail = document.getElementById('prefer-email') as HTMLInputElement;
                        const preferCall = document.getElementById('prefer-call') as HTMLInputElement;
                        
                        const contactPreferences: string[] = [];
                        if (preferWhatsapp && preferWhatsapp.checked) contactPreferences.push('WhatsApp');
                        if (preferEmail && preferEmail.checked) contactPreferences.push('Email');
                        if (preferCall && preferCall.checked) contactPreferences.push('Ligação');
                        
                        // Montar mensagem com preferências para o CRM
                        let notesMessage = message || '';
                        if (contactPreferences.length > 0) {
                          if (notesMessage) notesMessage += '\n\n';
                          notesMessage += `Preferências de contato: ${contactPreferences.join(', ')}`;
                        }
                        
                        // Criar um novo lead
                        fetch('/api/leads', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            name,
                            email,
                            phone,
                            message: notesMessage, // Mensagem com preferências de contato
                            source: 'property-contact-form',
                            status: 'new',
                            propertyId: currentProperty?.id,
                            propertyTitle: currentProperty?.title
                          }),
                        })
                        .then(response => response.json())
                        .then(leadData => {
                          if (leadData && leadData.id) {
                            // Criar uma nota para este lead com informações do imóvel
                            const propertyDetails = [
                              `Título: ${currentProperty?.title || 'N/A'}`,
                              `Código: ${currentProperty?.id || 'N/A'}`,
                              `Preço: R$ ${currentProperty?.price?.toLocaleString('pt-BR') || 'N/A'}`,
                              currentProperty?.iptuValue ? `IPTU: R$ ${currentProperty.iptuValue.toLocaleString('pt-BR')}/ano` : null,
                              currentProperty?.condoFee ? `Condomínio: R$ ${currentProperty.condoFee.toLocaleString('pt-BR')}/mês` : null,
                              `Tipo: ${currentProperty?.type || 'N/A'}`,
                              `Endereço: ${currentProperty?.address || 'N/A'}`,
                              `Bairro: ${currentProperty?.neighborhood || 'N/A'}`,
                              `Cidade: ${currentProperty?.city || 'N/A'}`,
                              `Quartos: ${currentProperty?.bedrooms || 'N/A'}`,
                              `Banheiros: ${currentProperty?.bathrooms || 'N/A'}`
                            ].filter(Boolean).join('\n');
                            
                            let noteContent = `Lead demonstrou interesse neste imóvel:\n\n${propertyDetails}`;
                            
                            // Adicionar mensagem do cliente e preferências de contato na nota
                            if (message) {
                              noteContent += `\n\nMensagem do cliente:\n${message}`;
                            }
                            
                            if (contactPreferences.length > 0) {
                              noteContent += `\n\nPreferências de contato: ${contactPreferences.join(', ')}`;
                            }
                            
                            // Criar a nota no CRM
                            return fetch(`/api/leads/${leadData.id}/notes`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                text: noteContent,
                                createdBy: agent?.name || 'Sistema',
                                type: 'property-interest'
                              }),
                            })
                            .then(() => {
                              // Limpar formulário
                              form.reset();
                              
                              // Mostrar modal de sucesso personalizado
                              const successModal = document.createElement('div');
                              successModal.className = 'fixed inset-0 flex items-center justify-center z-[9999]';
                              successModal.innerHTML = `
                                <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
                                <div class="relative rounded-lg bg-white dark:bg-gray-800 max-w-md w-full mx-4 sm:mx-auto shadow-xl overflow-hidden transform transition-all p-4 sm:p-6 text-center">
                                  <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <svg class="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  </div>
                                  <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">Mensagem enviada!</h3>
                                  <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-5 px-2">
                                    Um corretor entrará em contato em breve. Continue a conversa pelo WhatsApp agora.
                                  </p>
                                  <div class="flex flex-col sm:flex-row gap-2 justify-center">
                                    <button class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#25D366] rounded-md hover:bg-[#22c55e] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]" id="whatsapp-redirect">
                                      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.4 14.2l-2.1-.9c-.3-.1-.6 0-.9.2l-1 1.1c-.1.2-.4.2-.6.1l-.7-.3C11 13.7 10 12.8 9.3 11.9l-.3-.7c-.1-.2 0-.4.1-.6l1-1c.2-.2.3-.6.2-.9l-.9-2.1c-.2-.4-.6-.6-1-.6-.3 0-.6.1-.9.3l-1.1 1.1c-.3.3-.5.7-.5 1.1.3 2.4 1.3 4.7 2.9 6.5s4 2.9 6.5 3.2c.4 0 .8-.2 1.1-.5l1.1-1.1c.2-.2.3-.5.3-.9 0-.4-.2-.8-.6-1"></path>
                                      </svg>
                                      Conversar no WhatsApp
                                    </button>
                                    <button class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500" id="close-success-modal">
                                      Fechar
                                    </button>
                                  </div>
                                </div>
                              `;
                              
                              document.body.appendChild(successModal);
                              
                              // Preparar mensagem do WhatsApp
                              const phone = agent?.phone?.replace(/\D/g, '') || config?.whatsappNumber?.replace(/\D/g, '') || '';
                              const whatsMessage = `Olá, meu nome é ${name}. Tenho interesse no imóvel "${currentProperty?.title}" (Ref: ${currentProperty?.id})`;
                              const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(whatsMessage)}`;
                              
                              // Adicionar event listeners
                              document.getElementById('whatsapp-redirect')?.addEventListener('click', () => {
                                document.body.removeChild(successModal);
                                window.open(whatsappUrl, '_blank');
                              });
                              
                              document.getElementById('close-success-modal')?.addEventListener('click', () => {
                                document.body.removeChild(successModal);
                              });
                              
                              // Fechar ao clicar fora ou pressionar ESC
                              successModal.querySelector('.fixed.inset-0')?.addEventListener('click', () => {
                                document.body.removeChild(successModal);
                              });
                              
                              const handleEscKey = function(e: KeyboardEvent) {
                                if (e.key === 'Escape' && document.body.contains(successModal)) {
                                  document.body.removeChild(successModal);
                                  document.removeEventListener('keydown', handleEscKey);
                                }
                              };
                              
                              document.addEventListener('keydown', handleEscKey);
                              
                              // Fechar automaticamente após 20 segundos em dispositivos móveis
                              const isMobile = window.innerWidth < 768;
                              if (isMobile) {
                                setTimeout(() => {
                                  if (document.body.contains(successModal)) {
                                    document.body.removeChild(successModal);
                                    document.removeEventListener('keydown', handleEscKey);
                                  }
                                }, 20000);
                              }
                            });
                          } else {
                            throw new Error('Falha ao criar o lead');
                          }
                        })
                        .catch(error => {
                          console.error('Erro:', error);
                          alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
                        });
                      }}
                      className="space-y-4"
                    >
                      {/* Nome e Email numa linha */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-xs font-medium mb-1 text-gray-500 uppercase">
                            Nome completo*
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Digite seu nome"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-xs font-medium mb-1 text-gray-500 uppercase">
                            E-mail*
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Digite seu e-mail"
                          />
                        </div>
                      </div>
                      
                      {/* Telefone */}
                      <div>
                        <label htmlFor="phone" className="block text-xs font-medium mb-1 text-gray-500 uppercase">
                          Telefone/WhatsApp*
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      
                      {/* Mensagem */}
                      <div>
                        <label htmlFor="message" className="block text-xs font-medium mb-1 text-gray-500 uppercase">
                          Mensagem
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={3}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Tenho interesse neste imóvel. Gostaria de agendar uma visita..."
                        ></textarea>
                      </div>
                      
                      {/* Opções de contato preferencial */}
                      <div className="flex flex-wrap gap-3 mt-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="prefer-whatsapp" 
                            name="prefer-whatsapp" 
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                            defaultChecked={true}
                          />
                          <label htmlFor="prefer-whatsapp" className="ml-2 text-sm text-gray-600">
                            Contato por WhatsApp
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="prefer-email" 
                            name="prefer-email" 
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="prefer-email" className="ml-2 text-sm text-gray-600">
                            Contato por E-mail
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="prefer-call" 
                            name="prefer-call" 
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="prefer-call" className="ml-2 text-sm text-gray-600">
                            Prefiro receber ligação
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3 text-white font-medium rounded-md transition-colors shadow-sm flex items-center justify-center"
                          style={{ backgroundColor: config?.primaryColor || '#130a01', borderColor: config?.primaryColor || '#130a01' }}
                        >
                          <span className="text-base">
                            Enviar mensagem
                          </span>
                        </button>
                        <p className="text-xs mt-3 text-center text-gray-500">
                          Ao enviar, você concorda em receber contato de nossos corretores. Seus dados estão seguros conosco.
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
                
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

        {/* O botão flutuante de WhatsApp foi removido do modal para evitar elementos duplicados */}
      </div>
    </div>
  );
}