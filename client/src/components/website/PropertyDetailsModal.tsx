import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WebsiteConfig } from "shared/schema";
import LazyImage from "../ui/lazy-image";
import { PropertyDetailsModalProps } from "../../types";

interface MyPropertyDetailsModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
  config?: WebsiteConfig;
}

export default function PropertyDetailsModal({ propertyId, isOpen, onClose, config: propConfig }: MyPropertyDetailsModalProps) {
  const [showContactButton, setShowContactButton] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [remountKey, setRemountKey] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Quando o modal é aberto, force um remount dos componentes para resolver
  // o problema da imagem principal não aparecer
  useEffect(() => {
    if (isOpen) {
      setRemountKey(prevKey => prevKey + 1);
    }
  }, [isOpen, propertyId]);
  
  // Configuração do site
  const config = propConfig;
  
  // Buscar detalhes da propriedade
  const { data: currentProperty } = useQuery({
    queryKey: ['/api/properties', propertyId],
    enabled: isOpen && !!propertyId,
  });

  // Buscar agente responsável por esta propriedade
  const { data: agent } = useQuery({
    queryKey: ['/api/users', currentProperty?.userId],
    enabled: isOpen && !!currentProperty?.userId,
  });
  
  // Verificar se há imagens disponíveis
  const hasImages = currentProperty?.images && currentProperty.images.length > 0;
  
  // Monitor para mostrar o botão de contato fixo após rolagem
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;
    
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      if (scrollPercentage > 75) {
        setShowContactButton(true);
      } else {
        setShowContactButton(false);
      }
    };
    
    const currentContentRef = contentRef.current;
    currentContentRef.addEventListener('scroll', handleScroll);
    
    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isOpen]);
  
  // Fechar o modal ao pressionar ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Fechar o modal ao clicar fora do conteúdo
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  // Prevenir rolagem do body quando o modal estiver aberto
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
  
  // Cores para o tema de detalhes do imóvel
  const detailsBackgroundColor = config?.detailsBackgroundColor || '#ffffff';
  const detailsTextColor = config?.detailsTextColor || '#333333';
  const detailsIconsColor = config?.detailsIconsColor || '#7f651e';
  
  if (!isOpen || !currentProperty) return null;
  
  // Função para avançar para o próximo slide
  const nextSlide = () => {
    if (!currentProperty?.images) return;
    setCurrentSlide((prev) => (prev + 1) % currentProperty.images.length);
  };
  
  // Função para voltar ao slide anterior
  const prevSlide = () => {
    if (!currentProperty?.images) return;
    setCurrentSlide((prev) => (prev - 1 + currentProperty.images.length) % currentProperty.images.length);
  };
  
  // Função para compartilhar imóvel nas redes sociais
  const shareProperty = (platform: string) => {
    const url = window.location.href;
    const title = currentProperty.title;
    const description = currentProperty.description?.slice(0, 100) + '...';
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Confira este imóvel: ${url}`)}`, '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: detailsBackgroundColor }}
      >
        {/* Modal Header com botão de fechar */}
        <div className="flex justify-end p-2 absolute top-0 right-0 z-10">
          <button
            onClick={onClose}
            className="text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all"
            aria-label="Fechar"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        {/* Conteúdo do modal com scroll */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${detailsIconsColor} transparent` }}
        >
          <div>
            {/* Galeria de imagens */}
            <div className="relative h-[300px] md:h-[400px] overflow-hidden bg-gray-200">
              {hasImages ? (
                <>
                  <div className="h-full w-full" key={`${remountKey}-${propertyId}`}>
                    <LazyImage
                      src={currentProperty.images[currentSlide]}
                      alt={currentProperty.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Controles do slider */}
                  {currentProperty.images.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity"
                        aria-label="Imagem anterior"
                      >
                        <i className="ri-arrow-left-s-line text-2xl"></i>
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity"
                        aria-label="Próxima imagem"
                      >
                        <i className="ri-arrow-right-s-line text-2xl"></i>
                      </button>
                      
                      {/* Indicador de slides */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                        {currentProperty.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentSlide
                                ? 'bg-white w-4'
                                : 'bg-white bg-opacity-50'
                            }`}
                            aria-label={`Ir para imagem ${index + 1}`}
                          ></button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="ri-image-line text-5xl mb-3" style={{ color: `${detailsIconsColor}66` }}></i>
                    <p style={{ color: `${detailsTextColor}99` }}>Sem imagens disponíveis</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Compartilhar nas redes sociais */}
            <div className="p-2 flex justify-end gap-2 border-b" style={{ borderColor: `${detailsTextColor}22` }}>
              <button
                onClick={() => shareProperty('whatsapp')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${detailsIconsColor}20` }}
                aria-label="Compartilhar no WhatsApp"
              >
                <i className="fab fa-whatsapp text-[#25D366]"></i>
              </button>
              <button
                onClick={() => shareProperty('facebook')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${detailsIconsColor}20` }}
                aria-label="Compartilhar no Facebook"
              >
                <i className="fab fa-facebook-f text-[#1877F2]"></i>
              </button>
              <button
                onClick={() => shareProperty('twitter')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${detailsIconsColor}20` }}
                aria-label="Compartilhar no Twitter"
              >
                <i className="fab fa-twitter text-[#1DA1F2]"></i>
              </button>
              <button
                onClick={() => shareProperty('linkedin')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${detailsIconsColor}20` }}
                aria-label="Compartilhar no LinkedIn"
              >
                <i className="fab fa-linkedin-in text-[#0A66C2]"></i>
              </button>
              <button
                onClick={() => shareProperty('email')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${detailsIconsColor}20` }}
                aria-label="Compartilhar por E-mail"
              >
                <i className="fas fa-envelope text-[#EA4335]"></i>
              </button>
            </div>
            
            {/* Detalhes do imóvel */}
            <div className="p-6">
              {/* Header - Preço, Categoria e Título */}
              <div className="mb-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-2" style={{ backgroundColor: `${detailsIconsColor}20`, color: detailsIconsColor }}>
                      {currentProperty.category === 'rent' ? 'Aluguel' : 'Venda'}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold" style={{ color: detailsTextColor }}>{currentProperty.title}</h1>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm" style={{ color: `${detailsTextColor}99` }}>
                      {currentProperty.category === 'rent' ? 'Aluguel' : 'Valor'}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold" style={{ color: detailsIconsColor }}>
                      {currentProperty.price 
                        ? `R$ ${currentProperty.price.toLocaleString('pt-BR')}`
                        : 'Sob consulta'
                      }
                    </div>
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
              
              {/* Features */}
              {currentProperty.features && currentProperty.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3" style={{ color: detailsTextColor }}>Características</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {currentProperty.features.map((feature, index) => (
                      <div key={index} className="flex items-center" style={{ color: `${detailsTextColor}EE` }}>
                        <div className="w-6 h-6 mr-2 rounded-full flex items-center justify-center" style={{ backgroundColor: `${detailsIconsColor}20` }}>
                          <i className="fas fa-check text-xs" style={{ color: detailsIconsColor }}></i>
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
                  >
                    <div className="absolute left-0 top-0 h-full w-14 flex items-center justify-center bg-[#22c55e]">
                      <i className="fab fa-whatsapp text-xl"></i>
                    </div>
                    <span className="ml-10">Falar com um corretor</span>
                  </button>
                </div>
                
                {/* Formulário de contato */}
                <div className="mt-6 mb-4">
                  <h2 className="text-xl font-bold mb-3" style={{ color: detailsTextColor }}>Envie uma mensagem</h2>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${detailsIconsColor}10`, borderColor: `${detailsTextColor}22` }}>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        
                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        const name = formData.get('name') as string;
                        const email = formData.get('email') as string;
                        const phone = formData.get('phone') as string;
                        
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
                              `Tipo: ${currentProperty?.type || 'N/A'}`,
                              `Endereço: ${currentProperty?.address || 'N/A'}`,
                              `Bairro: ${currentProperty?.neighborhood || 'N/A'}`,
                              `Cidade: ${currentProperty?.city || 'N/A'}`,
                              `Quartos: ${currentProperty?.bedrooms || 'N/A'}`,
                              `Banheiros: ${currentProperty?.bathrooms || 'N/A'}`
                            ].join('\n');
                            
                            const noteContent = `Lead demonstrou interesse neste imóvel:\n\n${propertyDetails}`;
                            
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
                              
                              // Mostrar mensagem de sucesso
                              alert('Mensagem enviada com sucesso! Um de nossos corretores entrará em contato em breve.');
                              
                              // Opcionalmente, direcionar para WhatsApp
                              if (agent?.phone) {
                                const phone = agent.phone.replace(/\D/g, '');
                                const message = `Olá, meu nome é ${name}. Tenho interesse no imóvel "${currentProperty?.title}" (Ref: ${currentProperty?.id})`;
                                window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
                              } else if (config?.whatsappNumber) {
                                const phone = config.whatsappNumber.replace(/\D/g, '');
                                const message = `Olá, meu nome é ${name}. Tenho interesse no imóvel "${currentProperty?.title}" (Ref: ${currentProperty?.id})`;
                                window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
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
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: detailsTextColor }}>
                          Nome
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full px-3 py-2 border rounded-md"
                          style={{ borderColor: `${detailsTextColor}22`, color: detailsTextColor, backgroundColor: `${detailsBackgroundColor}80` }}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: detailsTextColor }}>
                          E-mail
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-3 py-2 border rounded-md"
                          style={{ borderColor: `${detailsTextColor}22`, color: detailsTextColor, backgroundColor: `${detailsBackgroundColor}80` }}
                          placeholder="Seu e-mail"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: detailsTextColor }}>
                          Telefone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          className="w-full px-3 py-2 border rounded-md"
                          style={{ borderColor: `${detailsTextColor}22`, color: detailsTextColor, backgroundColor: `${detailsBackgroundColor}80` }}
                          placeholder="Seu telefone com DDD"
                        />
                      </div>
                      
                      <div>
                        <button
                          type="submit"
                          className="w-full py-3 bg-[#25D366] text-white font-medium rounded-md hover:bg-[#22c55e] transition-colors"
                        >
                          Entrar em contato
                        </button>
                        <p className="text-xs mt-2 text-center" style={{ color: `${detailsTextColor}99` }}>
                          Ao enviar, você concorda em receber contato de nossos corretores
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              
              {/* Informações do corretor */}
              {agent && (
                <div className="border-t pt-6 mt-2" style={{ borderColor: `${detailsTextColor}22` }}>
                  <h2 className="text-xl font-bold mb-4" style={{ color: detailsTextColor }}>Corretor Responsável</h2>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 mr-4" style={{ borderColor: detailsIconsColor }}>
                      {agent.photoURL ? (
                        <img src={agent.photoURL} alt={agent.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200" style={{ backgroundColor: `${detailsIconsColor}20` }}>
                          <i className="ri-user-line text-2xl" style={{ color: detailsIconsColor }}></i>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: detailsTextColor }}>{agent.name}</h3>
                      {agent.creci && (
                        <p className="text-sm" style={{ color: `${detailsTextColor}BB` }}>CRECI: {agent.creci}</p>
                      )}
                      {agent.phone && (
                        <p className="text-sm mt-1" style={{ color: `${detailsTextColor}CC` }}>
                          <i className="ri-phone-line mr-1" style={{ color: detailsIconsColor }}></i>
                          {agent.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Botão de contato fixo que aparece após rolagem */}
        {showContactButton && agent && (
          <div className="fixed bottom-4 left-4 right-4 z-50 transition-opacity duration-300 opacity-100 flex justify-center">
            <button
              onClick={() => {
                // Abrir WhatsApp
                const phone = agent.phone?.replace(/\D/g, '') || '';
                const message = `Olá! Estou interessado no imóvel ${currentProperty.title} (Cód. LL${currentProperty.id})`;
                window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="bg-[#25D366] text-white py-3 px-6 rounded-full flex items-center shadow-lg hover:bg-[#22c55e] transition-colors"
              style={{
                backgroundColor: config?.contactButtonBackground || '#25D366',
                color: config?.contactButtonText || '#FFFFFF',
              }}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                {agent.photoURL ? (
                  <img src={agent.photoURL} alt={agent.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white bg-opacity-20">
                    <i className="ri-user-line text-xl"></i>
                  </div>
                )}
              </div>
              <span className="font-medium">Falar com corretor</span>
              <i className="fab fa-whatsapp text-xl ml-3"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}