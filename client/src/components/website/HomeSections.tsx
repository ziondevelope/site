import React from 'react';
import { Link } from 'wouter';
import { WebsiteConfig } from '@shared/schema';
import { Property } from "@shared/schema";
import PropertyFeaturedSlider from './PropertyFeaturedSlider';
import { Testimonials } from './Testimonials';
import LazyImage from '@/components/ui/lazy-image';

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

interface HomeSectionsProps {
  config?: WebsiteConfig;
  properties?: Property[];
  isLoadingProperties: boolean;
  featuredProperties: Property[];
  openPropertyModal: (propertyId: number) => void;
}

export default function HomeSections({ 
  config, 
  properties, 
  isLoadingProperties, 
  featuredProperties, 
  openPropertyModal 
}: HomeSectionsProps) {
  // Renderiza as seções conforme a ordem definida pelo usuário
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'featuredProperties':
        return config?.showFeaturedProperties !== false && featuredProperties.length > 0 && (
          <PropertyFeaturedSlider 
            key="featuredProperties"
            properties={featuredProperties} 
            onPropertyClick={openPropertyModal}
            config={config}
          />
        );
      
      case 'rentProperties':
        return config?.showRentProperties !== false && (
          <section key="rentProperties" id="rent-properties" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-left mb-12" style={{ color: config?.primaryColor || 'var(--primary)' }}>Imóveis para Aluguel</h2>
              
              {isLoadingProperties ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
                    <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {properties?.filter(property => property.purpose === 'rent' && property.status === 'available')
                    .slice(0, 8)
                    .map((property) => (
                      <div key={property.id}>
                        <div 
                          className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer relative"
                          onClick={() => openPropertyModal(property.id)}
                        >
                          {/* Property Image */}
                          <div className="property-image-container h-48 relative overflow-hidden">
                            {getFeaturedImage(property) ? (
                              <LazyImage 
                                src={getFeaturedImage(property)} 
                                alt={property.title || 'Imóvel'} 
                                className="property-image w-full h-full"
                                placeholderColor={config?.primaryColor ? `${config.primaryColor}15` : '#f3f4f6'}
                                aspectRatio="4/3"
                              />
                            ) : null}
                            {/* Botão Ver Detalhes que aparece no hover */}
                            <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                              <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                                <i className="fas fa-eye text-sm" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                                <span className="text-sm font-medium" style={{ color: config?.primaryColor || 'var(--primary)' }}>Ver Detalhes</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Property Details */}
                          <div className="p-5">
                            <h3 className="text-lg font-semibold mb-2 truncate">{property.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 truncate">{property.neighborhood}, {property.city}</p>
                            
                            {/* Property Price */}
                            <div className="text-lg font-bold mb-3" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                              R$ {property.price?.toLocaleString('pt-BR')}
                              {property.purpose === 'rent' && <span className="text-sm text-gray-600 font-normal">/mês</span>}
                            </div>
                            
                            {/* Property Amenities */}
                            <div className="flex items-center text-sm text-gray-500 space-x-3">
                              {property.bedrooms ? (
                                <div className="flex items-center">
                                  <i className="fas fa-bed mr-1"></i>
                                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</span>
                                </div>
                              ) : null}
                              
                              {property.bathrooms ? (
                                <div className="flex items-center">
                                  <i className="fas fa-bath mr-1"></i>
                                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Banho' : 'Banhos'}</span>
                                </div>
                              ) : null}
                              
                              {property.area ? (
                                <div className="flex items-center">
                                  <i className="fas fa-ruler-combined mr-1"></i>
                                  <span>{property.area}m²</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              
              <div className="mt-12 text-center">
                <Link 
                  to="/properties?purpose=rent" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white hover:bg-opacity-90 transition-all duration-200"
                  style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}
                >
                  Ver todos os imóveis para aluguel
                  <i className="fas fa-long-arrow-alt-right ml-2"></i>
                </Link>
              </div>
            </div>
          </section>
        );
      
      case 'saleProperties':
        return config?.showSaleProperties !== false && (
          <section key="saleProperties" id="sale-properties" className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-left mb-12" style={{ color: config?.primaryColor || 'var(--primary)' }}>Imóveis para Venda</h2>
              
              {isLoadingProperties ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
                    <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {properties?.filter(property => property.purpose === 'sale' && property.status === 'available')
                    .slice(0, 8)
                    .map((property) => (
                      <div key={property.id}>
                        <div 
                          className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => openPropertyModal(property.id)}
                        >
                          {/* Property Image */}
                          <div className="property-image-container h-48 relative overflow-hidden">
                            {getFeaturedImage(property) ? (
                              <LazyImage 
                                src={getFeaturedImage(property)} 
                                alt={property.title || 'Imóvel'} 
                                className="property-image w-full h-full"
                                placeholderColor={config?.primaryColor ? `${config.primaryColor}15` : '#f3f4f6'}
                                aspectRatio="4/3"
                              />
                            ) : null}
                            {/* Botão Ver Detalhes que aparece no hover */}
                            <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 bg-black bg-opacity-20">
                              <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                                <i className="fas fa-eye text-sm" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                                <span className="text-sm font-medium" style={{ color: config?.primaryColor || 'var(--primary)' }}>Ver Detalhes</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Property Details */}
                          <div className="p-5">
                            <h3 className="text-lg font-semibold mb-2 truncate">{property.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 truncate">{property.neighborhood}, {property.city}</p>
                            
                            {/* Property Price */}
                            <div className="text-lg font-bold mb-3" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                              R$ {property.price?.toLocaleString('pt-BR')}
                            </div>
                            
                            {/* Property Amenities */}
                            <div className="flex items-center text-sm text-gray-500 space-x-3">
                              {property.bedrooms ? (
                                <div className="flex items-center">
                                  <i className="fas fa-bed mr-1"></i>
                                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</span>
                                </div>
                              ) : null}
                              
                              {property.bathrooms ? (
                                <div className="flex items-center">
                                  <i className="fas fa-bath mr-1"></i>
                                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Banho' : 'Banhos'}</span>
                                </div>
                              ) : null}
                              
                              {property.area ? (
                                <div className="flex items-center">
                                  <i className="fas fa-ruler-combined mr-1"></i>
                                  <span>{property.area}m²</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              
              <div className="mt-12 text-center">
                <Link 
                  to="/properties?purpose=sale" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white hover:bg-opacity-90 transition-all duration-200"
                  style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}
                >
                  Ver todos os imóveis para venda
                  <i className="fas fa-long-arrow-alt-right ml-2"></i>
                </Link>
              </div>
            </div>
          </section>
        );
      
      case 'testimonials':
        return config?.showTestimonials !== false && (
          <section key="testimonials" id="testimonials" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: config?.primaryColor || 'var(--primary)' }}>O que nossos clientes dizem</h2>
              <Testimonials config={config} />
            </div>
          </section>
        );
      
      case 'aboutSection':
        return config?.showAboutSection !== false && (
          <section key="aboutSection" id="about" className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center">
                <div className="w-full md:w-1/2 mb-10 md:mb-0">
                  <div className="relative">
                    {config?.aboutImage ? (
                      <img 
                        src={config.aboutImage} 
                        alt="Sobre nós" 
                        className="rounded-lg shadow-lg max-w-full h-auto"
                      />
                    ) : (
                      <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i className="fas fa-building text-gray-400 text-6xl"></i>
                      </div>
                    )}
                    <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gray-100 rounded-lg -z-10"></div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-12">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                    {config?.aboutTitle || 'Quem Somos'}
                  </h2>
                  <h3 className="text-xl mb-6 text-gray-600">{config?.aboutSubtitle || 'Conheça Nossa História'}</h3>
                  <div className="prose max-w-none">
                    <p>{config?.aboutDescription || 'Somos uma imobiliária comprometida com a excelência em todos os aspectos do mercado imobiliário. Nossa equipe de profissionais dedicados está pronta para ajudá-lo a encontrar o imóvel perfeito ou vender seu imóvel atual pelo melhor preço possível. Com anos de experiência no mercado, conhecemos profundamente as regiões onde atuamos e podemos oferecer insights valiosos para nossos clientes.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Usar a ordem personalizada das seções ou a ordem padrão
  const sectionsOrder = config?.homeSectionsOrder && Array.isArray(config.homeSectionsOrder) 
    ? config.homeSectionsOrder 
    : ['featuredProperties', 'rentProperties', 'saleProperties', 'testimonials', 'aboutSection'];
  
  // Log para debugar a ordem das seções
  console.log('Ordem das seções configurada:', config?.homeSectionsOrder);
  console.log('Ordem das seções a ser usada:', sectionsOrder);
  
  return (
    <>
      {/* Renderizar seções na ordem definida */}
      {sectionsOrder.map(sectionId => renderSection(sectionId))}
    </>
  );
}