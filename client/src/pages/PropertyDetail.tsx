import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Property, User } from '@shared/schema';

export default function PropertyDetail() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id
  });
  
  // Fetch agent details if property is loaded
  const { data: agent } = useQuery<User>({
    queryKey: [`/api/agents/${property?.agentId}`],
    enabled: !!property?.agentId
  });
  
  // Fetch all properties for similar properties section
  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !!property
  });
  
  // Filter similar properties (same neighborhood, same type, etc.)
  const similarProperties = allProperties.filter(p => 
    p.id !== property?.id && 
    (p.neighborhood === property?.neighborhood || p.type === property?.type)
  ).slice(0, 4);

  // Função para navegar pelas imagens
  const navigateImage = (direction: 'next' | 'prev') => {
    if (!property?.images || property.images.length === 0) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex: number) => 
        prevIndex === property.images!.length - 1 ? 0 : prevIndex + 1
      );
    } else {
      setCurrentImageIndex((prevIndex: number) => 
        prevIndex === 0 ? property.images!.length - 1 : prevIndex - 1
      );
    }
  };

  // Selecionar uma imagem específica do thumbnail
  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    // Reset o índice da imagem quando mudar de propriedade
    setCurrentImageIndex(0);
  }, [id]);

  useEffect(() => {
    console.log('PropertyDetail - ID da URL:', id);
    console.log('PropertyDetail - Dados da propriedade:', property);
  }, [id, property]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">
            {isLoadingProperty ? 'Carregando detalhes do imóvel...' : 
              property ? `Detalhes do Imóvel - ${property.title || `Cód. LL${String(property.id).padStart(4, '0')}`}` :
              'Imóvel não encontrado'}
          </h1>
          
          {isLoadingProperty ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
            </div>
          ) : property ? (
            <div>
              {/* Slideshow de imagens */}
              {property.images && property.images.length > 0 && (
                <div className="rounded-xl overflow-hidden relative mb-6 group">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img 
                      src={typeof property.images[currentImageIndex] === 'object' 
                        ? property.images[currentImageIndex].url 
                        : property.images[currentImageIndex]} 
                      alt={property.title || 'Imóvel'} 
                      className="w-full h-[600px] object-cover"
                    />
                  </div>
                  
                  {/* Botões de navegação */}
                  <button 
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Imagem anterior"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Próxima imagem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                  
                  {/* Contador de imagens */}
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1}/{property.images.length}
                  </div>
                  
                  {/* Miniaturas abaixo da imagem principal */}
                  <div className="flex mt-2 space-x-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <div 
                        key={index} 
                        onClick={() => selectImage(index)}
                        className={`w-28 h-20 flex-shrink-0 rounded cursor-pointer border-2 ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-transparent hover:border-blue-300'
                        }`}
                      >
                        <img 
                          src={typeof image === 'object' ? image.url : image} 
                          alt={`Imagem ${index + 1}`} 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <h2 className="text-2xl font-semibold mb-2">{property.title || ''}</h2>
              <p className="text-gray-600 mb-4">{property.address || ''}</p>
              <p className="text-sm text-gray-500 mb-4">Cód. LL{String(property.id).padStart(4, '0')}</p>
              
              <div className="bg-gray-100 p-4 rounded mb-6">
                <div className="font-bold text-xl mb-2">
                  {property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Preço não informado'}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">Quartos:</span> {property.bedrooms || 0}
                  </div>
                  <div>
                    <span className="font-medium">Banheiros:</span> {property.bathrooms || 0}
                  </div>
                  <div>
                    <span className="font-medium">Área:</span> {property.area || 0}m²
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Descrição</h3>
                <p className="whitespace-pre-line">{property.description || 'Sem descrição disponível'}</p>
              </div>
              
              {/* Características */}
              {property.features && property.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Características</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-green-600 mr-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Informações do corretor */}
              {property.agentId && (
                <div className="mb-6 border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Corretor Responsável</h3>
                  <div className="flex items-center">
                    <div className="bg-gray-200 w-16 h-16 rounded-full flex-shrink-0 overflow-hidden">
                      {agent?.avatar ? (
                        <img 
                          src={agent.avatar} 
                          alt={agent.displayName || 'Corretor'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold">{agent?.displayName || `Corretor ID: ${property.agentId}`}</p>
                      {agent?.role === 'agent' && <p className="text-sm text-gray-600">CRECI: {agent.id}9876</p>}
                      <p className="text-sm text-gray-600 mt-1">Entre em contato para mais informações sobre este imóvel</p>
                      <div className="mt-2 flex gap-2">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                          Entrar em contato
                        </button>
                        {agent?.phone && (
                          <a 
                            href={`tel:${agent.phone}`} 
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium flex items-center hover:bg-gray-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Ligar
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-100 p-4 rounded">
              <h3 className="text-red-800 font-medium">Imóvel não encontrado</h3>
              <p className="text-red-700">Não foi possível encontrar o imóvel com ID {id}</p>
            </div>
          )}
          
          {/* Imóveis Similares */}
          {property && similarProperties.length > 0 && (
            <div className="mt-10 mb-8 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Imóveis Similares</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProperties.map((similarProperty) => (
                  <div key={similarProperty.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 relative">
                      {similarProperty.images && similarProperty.images.length > 0 && (
                        <img 
                          src={typeof similarProperty.images[0] === 'object' 
                            ? similarProperty.images[0].url 
                            : similarProperty.images[0]
                          } 
                          alt={similarProperty.title || 'Imóvel'} 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {similarProperty.purpose && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          {similarProperty.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{similarProperty.title || ''}</h3>
                      <p className="text-sm text-gray-500 truncate">{similarProperty.address || ''}</p>
                      <div className="mt-2 text-lg font-bold">
                        {similarProperty.price 
                          ? `R$ ${similarProperty.price.toLocaleString('pt-BR')}` 
                          : 'Preço não informado'
                        }
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-600 space-x-4">
                        <div>{similarProperty.bedrooms || 0} quartos</div>
                        <div>{similarProperty.bathrooms || 0} banheiros</div>
                        <div>{similarProperty.area || 0}m²</div>
                      </div>
                      <div className="mt-3">
                        <Link href={`/property/${similarProperty.id}`}>
                          <Button variant="outline" className="w-full text-center text-sm">
                            Ver detalhes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex gap-4">
            <Link href="/">
              <Button>Voltar para Home</Button>
            </Link>
            <Link href="/admin/imoveis">
              <Button variant="outline">Ver Todos os Imóveis</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}