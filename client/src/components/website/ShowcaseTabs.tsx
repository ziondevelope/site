import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Property, WebsiteConfig } from '@shared/schema';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property as PropertyCard } from '../../components/property/Property';
import { MapPin, Home, ArrowRight, ArrowLeft } from 'lucide-react';
import './showcase-tabs.css';

interface ShowcaseTabsProps {
  config?: WebsiteConfig;
  onPropertyClick?: (id: number) => void;
}

// Tipo definido para as categorias de imóveis
type PropertyCategory = {
  id: string;
  label: string;
  purpose?: string;
  type?: string;
  neighborhood?: string;
  isFeatured?: boolean;
};

export default function ShowcaseTabs({ config, onPropertyClick }: ShowcaseTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideWidth = useRef<number>(0);
  const [tabsWidth, setTabsWidth] = useState<Record<string, number>>({});
  const itemsPerSlide = useRef<number>(4); // Default para desktop, será ajustado para mobile

  // Categorias de imóveis que serão exibidas como abas
  const categories: PropertyCategory[] = [
    { id: 'all', label: 'Todos os imóveis' },
    { id: 'sale', label: 'À Venda', purpose: 'sale' },
    { id: 'rent', label: 'Para Alugar', purpose: 'rent' },
    { id: 'featured', label: 'Destaques', isFeatured: true },
    { id: 'apartment', label: 'Apartamentos', type: 'apartment' },
    { id: 'house', label: 'Casas', type: 'house' },
  ];

  // Buscar imóveis
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    refetchOnWindowFocus: false,
  });

  // Buscar configurações, caso não estejam disponíveis nas props
  const { data: configData } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    enabled: !config,
  });

  // Configuração final (do prop ou do fetch)
  const finalConfig = config || configData;
  const primaryColor = finalConfig?.primaryColor || '#7f651e';

  // Função para filtrar os imóveis conforme a categoria selecionada
  const filterProperties = (category: PropertyCategory): Property[] => {
    if (!properties) return [];

    return properties.filter((property) => {
      if (category.id === 'all') return true;
      if (category.purpose && property.purpose === category.purpose) return true;
      if (category.type && property.type === category.type) return true;
      if (category.neighborhood && property.neighborhood === category.neighborhood) return true;
      if (category.isFeatured && property.isFeatured) return true;
      return false;
    });
  };

  // Atualiza largura dos slides e número de itens por slide baseado no tamanho da tela
  useEffect(() => {
    const updateDimensions = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.offsetWidth;
        
        // Ajustar quantos itens mostrar por slide baseado no tamanho da tela
        if (window.innerWidth < 640) {
          itemsPerSlide.current = 1;
        } else if (window.innerWidth < 1024) {
          itemsPerSlide.current = 2;
        } else if (window.innerWidth < 1280) {
          itemsPerSlide.current = 3;
        } else {
          itemsPerSlide.current = 4;
        }
        
        // Calcula a largura de cada slide
        slideWidth.current = containerWidth;
        
        // Atualiza o state com as larguras para cada tab
        const newTabsWidth: Record<string, number> = {};
        categories.forEach(category => {
          const filteredItems = filterProperties(category);
          const slides = Math.ceil(filteredItems.length / itemsPerSlide.current);
          newTabsWidth[category.id] = slides > 0 ? slides * containerWidth : containerWidth;
        });
        
        setTabsWidth(newTabsWidth);
        
        // Reset para o primeiro slide quando redimensionar
        setCurrentSlide(0);
      }
    };

    // Atualizar ao montar o componente
    updateDimensions();
    
    // Adicionar event listener para redimensionamento
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [properties, activeTab]);

  // Função para navegar para o próximo slide
  const nextSlide = () => {
    if (!properties) return;
    
    const filteredItems = filterProperties(categories.find(c => c.id === activeTab) || categories[0]);
    const slides = Math.ceil(filteredItems.length / itemsPerSlide.current);
    
    if (currentSlide < slides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Voltar para o início quando chegar ao final
      setCurrentSlide(0);
    }
  };

  // Função para navegar para o slide anterior
  const prevSlide = () => {
    if (!properties) return;
    
    const filteredItems = filterProperties(categories.find(c => c.id === activeTab) || categories[0]);
    const slides = Math.ceil(filteredItems.length / itemsPerSlide.current);
    
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    } else {
      // Ir para o último slide quando estiver no primeiro
      setCurrentSlide(slides - 1);
    }
  };

  // Reseta o currentSlide para 0 quando muda a aba
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeTab]);

  // Se não há imóveis ou está carregando, mostra um skeleton
  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold animate-pulse bg-gray-200 h-8 w-40"></h2>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 showcase-tabs-container">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
            Nossos Imóveis
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-white border hover:shadow-md transition-all"
              aria-label="Slide anterior"
              style={{ borderColor: `${primaryColor}40` }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: primaryColor }} />
            </button>
            <button 
              onClick={nextSlide}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-white border hover:shadow-md transition-all"
              aria-label="Próximo slide"
              style={{ borderColor: `${primaryColor}40` }}
            >
              <ArrowRight className="w-5 h-5" style={{ color: primaryColor }} />
            </button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex overflow-x-auto space-x-2 pb-2 showcase-tabs-list">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="showcase-tab-trigger px-4 py-2 text-sm whitespace-nowrap"
                style={{ 
                  '--tab-active-color': primaryColor,
                  '--tab-hover-color': `${primaryColor}20`,
                  '--tab-active-border-color': primaryColor
                } as React.CSSProperties}
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => {
            const filteredItems = filterProperties(category);
            
            return (
              <TabsContent 
                key={category.id} 
                value={category.id}
                className="focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="showcase-carousel-container overflow-hidden">
                  <div 
                    ref={carouselRef}
                    className="showcase-carousel-track flex transition-transform duration-300"
                    style={{ 
                      width: tabsWidth[category.id] || 'auto',
                      transform: `translateX(-${currentSlide * slideWidth.current}px)` 
                    }}
                  >
                    {filteredItems.length > 0 ? (
                      <>
                        {Array.from({ length: Math.ceil(filteredItems.length / itemsPerSlide.current) }).map((_, slideIndex) => (
                          <div 
                            key={`slide-${slideIndex}`}
                            className="showcase-slide flex flex-nowrap"
                            style={{ width: slideWidth.current + 'px' }}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                              {filteredItems
                                .slice(slideIndex * itemsPerSlide.current, (slideIndex + 1) * itemsPerSlide.current)
                                .map((property) => (
                                  <PropertyCard 
                                    key={property.id} 
                                    property={property}
                                    primaryColor={primaryColor}
                                    onClick={onPropertyClick}
                                  />
                                ))}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex items-center justify-center w-full p-12 text-center">
                        <div className="text-gray-400">
                          <Home className="w-12 h-12 mx-auto mb-4" />
                          <p>Nenhum imóvel encontrado nesta categoria.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {filteredItems.length > 0 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    {Array.from({ length: Math.ceil(filteredItems.length / itemsPerSlide.current) }).map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentSlide === index ? 'w-4 opacity-100' : 'opacity-50'
                        }`}
                        style={{ 
                          backgroundColor: currentSlide === index ? primaryColor : '#ccc'
                        }}
                        aria-label={`Ir para slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
                
                {filteredItems.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <Link href={`/properties?tipo=${category.id !== 'all' ? category.id : ''}`}>
                      <div 
                        className="flex items-center px-6 py-2 rounded-md transition-all cursor-pointer"
                        style={{ 
                          backgroundColor: `${primaryColor}10`, 
                          color: primaryColor 
                        }}
                      >
                        Ver todos os imóveis
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}