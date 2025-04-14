import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Property, WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface PropertyDetailsContentProps {
  propertyId: number | string;
  isModal?: boolean;
  onClose?: () => void;
  primaryColor?: string;
}

export default function PropertyDetailsContent({ 
  propertyId, 
  isModal = false, 
  onClose,
  primaryColor = 'var(--primary)'
}: PropertyDetailsContentProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId
  });
  
  // Fetch agent data
  const { data: agent } = useQuery<any>({
    queryKey: [`/api/agents/${property?.agentId}`],
    enabled: !!property?.agentId,
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

  // Logging para depuração
  useEffect(() => {
    console.log("PropertyDetails - Dados da propriedade:", property);
    console.log("PropertyDetails - Dados do agente:", agent);
    console.log("PropertyDetails - ID do agente:", property?.agentId);
  }, [property, agent]);

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Property current visual
  const currentProperty = property;

  if (isLoadingProperty) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
        
        <div className="h-[500px] bg-gray-200 rounded-xl mb-6"></div>
        
        <div className="flex space-x-2 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-24 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-[400px] bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProperty) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Imóvel não encontrado</p>
      </div>
    );
  }

  return (
    <>
      {/* Navegação e código (apenas fora do modal) */}
      {!isModal && (
        <div className="flex flex-wrap justify-between items-center mb-2">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/">
              <span className="cursor-pointer hover:text-gray-700">Home</span>
            </Link>
            <i className="ri-arrow-right-s-line mx-1"></i>
            <Link href="/">
              <span className="cursor-pointer hover:text-gray-700">Imóveis</span>
            </Link>
            <i className="ri-arrow-right-s-line mx-1"></i>
            <span className="text-gray-700">{currentProperty.title}</span>
          </div>
        </div>
      )}
      
      {/* Layout de duas colunas principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da esquerda - Conteúdo principal */}
        <div className="lg:col-span-2">
          {/* Galeria de imóveis no estilo da referência */}
          <div className="rounded-xl overflow-hidden relative mb-6 group">
            {/* Grid de galeria */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[500px]">
              {/* Imagem principal (ocupa 3 colunas na versão desktop) */}
              <div 
                className="md:col-span-3 h-full relative rounded overflow-hidden"
                style={{
                  backgroundImage: activeImage ? `url(${activeImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!activeImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <i className="ri-image-line text-4xl text-gray-400"></i>
                  </div>
                )}
                
                {/* Contador de fotos */}
                {currentProperty.images && currentProperty.images.length > 0 && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    <i className="ri-camera-line mr-1"></i>
                    <span>{currentProperty.images.length} fotos</span>
                  </div>
                )}
                
                {/* Botões de navegação na imagem principal (visíveis em hover) */}
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
                            const prevUrl = typeof prevImg === 'object' && prevImg.url 
                              ? prevImg.url 
                              : typeof prevImg === 'string' 
                                ? prevImg 
                                : '';
                            if (prevUrl) setActiveImage(prevUrl);
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
                            const nextUrl = typeof nextImg === 'object' && nextImg.url 
                              ? nextImg.url 
                              : typeof nextImg === 'string' 
                                ? nextImg 
                                : '';
                            if (nextUrl) setActiveImage(nextUrl);
                          }
                        }
                      }}
                    >
                      <i className="ri-arrow-right-s-line text-2xl text-gray-800"></i>
                    </button>
                  </>
                )}
              </div>
              
              {/* Coluna de miniaturas (desktop) */}
              <div className="hidden md:flex md:flex-col gap-2 h-full">
                {currentProperty.images && currentProperty.images.length > 0 ? (
                  // Exibe até 3 miniaturas + botão "ver mais"
                  <>
                    {currentProperty.images.slice(0, 3).map((image, index) => {
                      // Determinar a URL da imagem dependendo do formato
                      const imageUrl = typeof image === 'object' && image.url 
                        ? image.url 
                        : typeof image === 'string' 
                          ? image 
                          : '';
                          
                      if (!imageUrl) return null;
                          
                      return (
                        <div 
                          key={index}
                          className={`h-[32%] rounded overflow-hidden cursor-pointer ${
                            currentProperty.images && index === 2 && currentProperty.images.length > 3 ? 'relative' : ''
                          }`}
                          onClick={() => setActiveImage(imageUrl)}
                        >
                          <img 
                            src={imageUrl} 
                            alt={`Imagem ${index + 1} do imóvel`}
                            className={`w-full h-full object-cover transition-all ${
                              activeImage === imageUrl ? 'ring-2 ring-offset-2 ring-primary' : 'hover:brightness-90'
                            }`}
                          />
                          
                          {/* Overlay "Ver mais" na última miniatura visível */}
                          {currentProperty.images && index === 2 && currentProperty.images.length > 3 && (
                            <div 
                              className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-medium cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Aqui poderia abrir uma galeria modal
                                window.alert('Galeria de imagens completa em desenvolvimento');
                              }}
                            >
                              <span>Ver mais</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  // Placeholders quando não há imagens
                  <>
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="h-[32%] bg-gray-100 rounded"></div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Título e preço no estilo da nova referência */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mr-4 flex items-center">
                {currentProperty.title}
                <button className="ml-3 text-gray-500 hover:text-gray-700">
                  <i className="ri-share-line text-xl"></i>
                </button>
              </h1>
              <div 
                className="text-2xl md:text-3xl font-bold mt-3 lg:mt-0"
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
              <div className="grid grid-cols-5 gap-4">
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
          
          {/* Descrição */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Descrição</h2>
            <p className="text-gray-600 whitespace-pre-line">{currentProperty.description}</p>
          </div>
          
          {/* Características */}
          {currentProperty.features && currentProperty.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Características</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentProperty.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <i className="ri-check-line mr-2 text-green-500"></i>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Coluna da direita - Informações do corretor */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Informações de contato</h3>
            
            {agent ? (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  {agent.avatar ? (
                    <img
                      src={agent.avatar}
                      alt={agent.displayName}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
                      <i className="ri-user-line text-gray-400 text-2xl"></i>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{agent.displayName}</h4>
                    <p className="text-gray-500 text-sm">{agent.role || 'Corretor'}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {agent.phone && (
                    <div className="flex items-center">
                      <i className="ri-phone-line mr-3 text-gray-500"></i>
                      <span>{agent.phone}</span>
                    </div>
                  )}
                  
                  {agent.email && (
                    <div className="flex items-center">
                      <i className="ri-mail-line mr-3 text-gray-500"></i>
                      <span>{agent.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="animate-pulse mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-gray-200 mr-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-gray-200 mr-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form de contato rápido */}
            <h3 className="text-lg font-bold mb-4">Entre em contato</h3>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Seu email"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Seu telefone"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <textarea
                  placeholder="Mensagem"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary"
                  defaultValue={`Olá, tenho interesse no imóvel ${currentProperty.title} (Código: LL${currentProperty.id}). Por favor, entre em contato.`}
                />
              </div>
              <Button
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                Enviar mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Botões de ação no modal */}
      {isModal && onClose && (
        <div className="mt-8 flex flex-wrap gap-4 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
          <Button
            onClick={() => window.location.href = `/properties/${propertyId}`}
          >
            Ver página completa
          </Button>
        </div>
      )}
    </>
  );
}