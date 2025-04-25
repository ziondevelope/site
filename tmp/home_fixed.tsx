import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WebsiteConfig } from '@shared/schema';
import Header from '@/components/website/Header';
import { Property } from "@shared/schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShower, faBed, faRulerCombined, faCar, faBath } from "@fortawesome/free-solid-svg-icons";
import PropertyDetailsModal from '@/components/website/PropertyDetailsModal';
import PropertyFeaturedSlider from '@/components/website/PropertyFeaturedSlider';
import { Testimonials } from '@/components/website/Testimonials';
import { useLoading } from "@/contexts/LoadingContext";
import SEO from '@/components/website/SEO';
import Footer from '@/components/Footer';
import LazyImage from '@/components/ui/lazy-image';
import HomeSections from '@/components/website/HomeSections';
import '../styles/hover-effects.css';
import imobsiteLogo from '../assets/imobsite-logo.png';

// Função utilitária para obter a imagem de destaque do imóvel
const getFeaturedImage = (property: Property): string | undefined => {
  // Se tiver array de imagens com formato { url, isFeatured }
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    // Procura por uma imagem marcada como destaque
    const featuredImage = property.images.find(img => 
      typeof img === 'object' && 'isFeatured' in img && img.isFeatured
    );
    
    // Se encontrou imagem de destaque, retorna sua URL
    if (featuredImage && typeof featuredImage === 'object' && 'url' in featuredImage) {
      return featuredImage.url;
    }
    
    // Se não encontrou imagem de destaque, retorna a primeira imagem
    if (property.images[0] && typeof property.images[0] === 'object' && 'url' in property.images[0]) {
      return property.images[0].url;
    }
  }
  
  return undefined;
};

export default function Home() {
  const [location, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const [carouselPage, setCarouselPage] = useState(0);
  const { stopLoading } = useLoading();
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);
  
  // Estado para o modal de detalhes do imóvel
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Função para abrir o modal
  const openPropertyModal = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setIsModalOpen(true);
  };
  
  // Função para fechar o modal
  const closePropertyModal = () => {
    setIsModalOpen(false);
  };

  const { data: config, isLoading: isLoadingConfig } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    queryFn: async () => {
      return apiRequest<WebsiteConfig>('/api/website/config');
    },
  });

  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      return apiRequest<Property[]>('/api/properties');
    },
  });
  
  // Filtra apenas os imóveis marcados como destaque
  const featuredProperties = properties?.filter(property => property.isFeatured) || [];
  
  // Calcula o número de páginas no carrossel baseado na quantidade de imóveis em destaque
  const itemsPerPage = 4; // Quantidade de itens por página do carrossel
  const totalCarouselPages = featuredProperties.length > 0 
    ? Math.ceil(featuredProperties.length / itemsPerPage) 
    : 1;

  // Efeito para monitorar o scroll e mudar a aparência do header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Definindo as fontes com base na configuração
  useEffect(() => {
    if (config) {
      // Configurar fontes
      document.documentElement.style.setProperty('--heading-font', `'${config.headingFont || 'Inter'}', sans-serif`);
      document.documentElement.style.setProperty('--body-font', `'${config.bodyFont || 'Inter'}', sans-serif`);
      
      // Configurar cores
      document.documentElement.style.setProperty('--primary', config.primaryColor || '#3B82F6');
      document.documentElement.style.setProperty('--secondary', config.secondaryColor || '#10B981');
      
      console.log('Fontes aplicadas:', {
        heading: config.headingFont,
        body: config.bodyFont
      });
      
      // Debug das configurações
      console.log('Configurações:', config);
      console.log('Telefone:', config.phone);
    }
  }, [config]);
  
  // Parar a animação de carregamento quando os dados forem carregados
  useEffect(() => {
    if (!isLoadingProperties && !isLoadingConfig) {
      stopLoading();
      
      // Pré-carregar imagens de destaque para melhorar o desempenho percebido
      if (properties && properties.length > 0) {
        // Priorizar o carregamento das primeiras 3 imagens (visíveis imediatamente)
        const firstImages = properties.slice(0, 3)
          .map(prop => getFeaturedImage(prop))
          .filter(Boolean) as string[];
          
        if (firstImages.length > 0) {
          // Criar Image objects para pré-carregar
          firstImages.forEach(src => {
            const img = new Image();
            img.src = src;
          });
        }
        
        // Carregar o restante das imagens com um atraso
        setTimeout(() => {
          const remainingImages = properties.slice(3)
            .map(prop => getFeaturedImage(prop))
            .filter(Boolean) as string[];
            
          remainingImages.forEach(src => {
            const img = new Image();
            img.loading = 'lazy';
            img.src = src;
          });
        }, 3000);
      }
    }
  }, [isLoadingProperties, isLoadingConfig, stopLoading, properties]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO Component */}
      <SEO 
        title={config?.seoTitle}
        description={config?.seoDescription}
        keywords={config?.seoKeywords}
        favicon={config?.logo}
        ogImage={config?.bannerBackground}
      />
      
      {/* Usar o componente Header reutilizável */}
      <Header config={config} isLoadingConfig={isLoadingConfig} />
      
      {/* Hero Section */}
      <section 
        id="home" 
        className="pt-36 pb-32 md:pb-48 text-white relative overflow-hidden"
        style={{
          background: !config?.bannerBackground 
            ? (config?.primaryColor 
              ? `linear-gradient(to right, ${config.primaryColor}DD, ${config.primaryColor})` 
              : 'linear-gradient(to right, #3b82f6, var(--primary))')
            : 'transparent'
        }}
      >
        {config?.bannerBackground && (
          <>
            {/* Fundo de cor para exibir enquanto carrega a imagem */}
            <div 
              className="absolute inset-0 z-0"
              style={{ 
                background: config?.primaryColor 
                  ? `linear-gradient(to right, ${config.primaryColor}DD, ${config.primaryColor})` 
                  : 'linear-gradient(to right, #3b82f6, var(--primary))'
              }}
            ></div>
            {/* Imagem de fundo com lazy loading e fade in */}
            <div 
              className="absolute inset-0 z-0 bg-black/50"
              style={{
                backgroundImage: `url(${config.bannerBackground})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                opacity: 1,
                transition: 'opacity 0.5s ease-in'
              }}
            ></div>
          </>
        )}
        <div className="container mx-auto px-4 text-center relative z-20">
          {config?.showBannerText && (
            <div className="mx-auto max-w-4xl mb-6 md:mb-10 pt-8 md:pt-12 px-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 md:mb-4">{config?.bannerTitle || "Encontre o imóvel dos seus sonhos"}</h1>
              {config?.bannerSubtitle && (
                <p className="text-lg mb-4 md:mb-8">{config.bannerSubtitle}</p>
              )}
            </div>
          )}
          
          {/* Barra de Filtro */}
          {config?.showSearchBar && (
            <div 
              className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-md p-3 md:p-5 shadow-xl"
            >
              <form 
                className="flex flex-col md:flex-row gap-2 md:gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  
                  // Obter os valores dos campos
                  const formData = new FormData(e.currentTarget);
                  const tipo = formData.get('tipo') as string;
                  const cidade = formData.get('cidade') as string;
                  const finalidade = formData.get('finalidade') as string;
                  
                  // Construir a URL com os parâmetros de busca
                  let url = '/properties?';
                  const params = new URLSearchParams();
                  
                  if (tipo && tipo !== 'all') {
                    params.append('type', tipo);
                  }
                  
                  if (cidade) {
                    params.append('city', cidade);
                  }
                  
                  if (finalidade === 'comprar') {
                    params.append('purpose', 'sale');
                  } else if (finalidade === 'alugar') {
                    params.append('purpose', 'rent');
                  }
                  
                  // Redirecionar para a página de propriedades com os filtros
                  setLocation(`/properties?${params.toString()}`);
                }}
              >
                {/* Tipo de Imóvel */}
                <div className="flex-1">
                  <div className="relative">
                    <select 
                      name="tipo"
                      className="w-full appearance-none rounded-md px-4 py-3 bg-white border text-black text-sm"
                      style={{ 
                        borderWidth: '0.5px', 
                        borderColor: config?.primaryColor ? `${config.primaryColor}40` : '#8BC34A40' 
                      }}
                      defaultValue="all"
                    >
                      <option value="all">Tipo de Imóvel</option>
                      <option value="apartment">Apartamento</option>
                      <option value="house">Casa</option>
                      <option value="commercial">Comercial</option>
                      <option value="land">Terreno</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-500 text-xs"></i>
                    </div>
                  </div>
                </div>
                
                {/* Localização/Cidade */}
                <div className="flex-1">
                  <input 
                    type="text"
                    name="cidade"
                    placeholder="Cidade"
                    className="w-full rounded-md px-4 py-3 bg-white border text-black text-sm"
                    style={{ 
                      borderWidth: '0.5px', 
                      borderColor: config?.primaryColor ? `${config.primaryColor}40` : '#8BC34A40' 
                    }}
                  />
                </div>
                
                {/* Finalidade */}
                <div className="flex-1">
                  <div className="relative">
                    <select 
                      name="finalidade"
                      className="w-full appearance-none rounded-md px-4 py-3 bg-white border text-black text-sm"
                      style={{ 
                        borderWidth: '0.5px', 
                        borderColor: config?.primaryColor ? `${config.primaryColor}40` : '#8BC34A40' 
                      }}
                      defaultValue="all"
                    >
                      <option value="all">Comprar ou Alugar</option>
                      <option value="comprar">Comprar</option>
                      <option value="alugar">Alugar</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-500 text-xs"></i>
                    </div>
                  </div>
                </div>
                
                {/* Botão Buscar */}
                <div className="flex-initial">
                  <button 
                    type="submit"
                    className="w-full rounded-md py-3 px-4 text-white text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                    style={{ 
                      backgroundColor: config?.primaryColor || '#8BC34A',
                      minWidth: '100px'
                    }}
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Cards de qualidades sobrepostos no rodapé do Hero */}
      {config?.showQualityCards !== false && (
        <div className="relative z-10 -mt-24 mb-8">
          <div className="container mx-auto px-4">
            {/* Exibição em desktop: grid normal */}
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              
              {/* Primeiro Card */}
              {config?.qualityCard1Enabled !== false && (
                <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                  <h3 className="text-xl font-semibold mb-3">{config?.qualityCard1Title || 'Os melhores imóveis'}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {config?.qualityCard1Text || 'Escolha entre apartamentos, casas, salas, ... Considere uma visita com um dos nossos corretores'}
                  </p>
                </div>
              )}
              
              {/* Segundo Card */}
              {config?.qualityCard2Enabled !== false && (
                <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                  <h3 className="text-xl font-semibold mb-3">{config?.qualityCard2Title || 'Vamos acompanhar você'}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {config?.qualityCard2Text || 'Oferecemos a você a melhor consultoria na escolha do seu imóvel, desde a escolha da localização, tipo e características'}
                  </p>
                </div>
              )}
              
              {/* Terceiro Card */}
              {config?.qualityCard3Enabled !== false && (
                <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                  <h3 className="text-xl font-semibold mb-3">{config?.qualityCard3Title || 'Sempre a melhor condição'}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {config?.qualityCard3Text || 'Nossa equipe irá buscar a melhor condição de fechamento, inclusive oferecendo consultoria no financiamento'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Versão mobile: apenas o primeiro card */}
            <div className="block md:hidden">
              {config?.qualityCard1Enabled !== false && (
                <div className="rounded-lg p-6 shadow-lg text-white" style={{ backgroundColor: config?.primaryColor || '#001219' }}>
                  <h3 className="text-xl font-semibold mb-3">{config?.qualityCard1Title || 'Os melhores imóveis'}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {config?.qualityCard1Text || 'Escolha entre apartamentos, casas, salas, ... Considere uma visita com um dos nossos corretores'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Renderizar seções na ordem configurada pelo usuário */}
      <HomeSections 
        config={config}
        properties={properties}
        isLoadingProperties={isLoadingProperties} 
        featuredProperties={featuredProperties}
        openPropertyModal={openPropertyModal}
      />
      
      {/* Modal para visualização de detalhes do imóvel */}
      {selectedPropertyId && (
        <PropertyDetailsModal 
          propertyId={selectedPropertyId} 
          isOpen={isModalOpen} 
          onClose={closePropertyModal}
          config={config}
        />
      )}
      
      {/* Footer */}
      <Footer config={config} />
    </div>
  );
}