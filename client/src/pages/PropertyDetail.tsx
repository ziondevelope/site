import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Property } from '@shared/schema';

export default function PropertyDetail() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id
  });

  // Função para navegar pelas imagens
  const navigateImage = (direction: 'next' | 'prev') => {
    if (!property?.images || property.images.length === 0) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
      );
    } else {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
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
          <h1 className="text-3xl font-bold mb-4">Detalhes do Imóvel ID: {id}</h1>
          
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
            </div>
          ) : (
            <div className="bg-red-100 p-4 rounded">
              <h3 className="text-red-800 font-medium">Imóvel não encontrado</h3>
              <p className="text-red-700">Não foi possível encontrar o imóvel com ID {id}</p>
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