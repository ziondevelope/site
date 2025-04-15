import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Property, WebsiteConfig } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import PropertyDetailsModal from '@/components/website/PropertyDetailsModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/website/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PriceRangeSlider } from '@/components/ui/price-range-slider';
import { useLoading } from '@/contexts/LoadingContext';
import '@/styles/hover-effects.css';

// Função para obter a imagem em destaque do imóvel
const getFeaturedImage = (property: Property): string | undefined => {
  if (!property.images || property.images.length === 0) return undefined;
  
  // Primeiro tenta encontrar a imagem marcada como destaque
  const featuredImage = property.images.find(img => img.isFeatured);
  if (featuredImage) return featuredImage.url;
  
  // Se não encontrar imagem em destaque, usa a primeira imagem
  return property.images[0].url;
};

export default function AllProperties() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const { stopLoading } = useLoading();
  
  // Estados para os filtros
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'all',
    bedrooms: 'any-bedrooms',
    bathrooms: 'any-bathrooms',
    minPrice: 0,
    maxPrice: 20000000,
    purpose: 'all-purposes',
    area: 'any-area'
  });
  
  // Estado para a ordenação
  const [sortOrder, setSortOrder] = useState('most_relevant');

  // Efeito para monitorar o scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Buscar a configuração do site
  const { data: config, isLoading: isLoadingConfig } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    queryFn: async () => {
      return apiRequest<WebsiteConfig>('/api/website/config');
    },
  });

  // Buscar todos os imóveis
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      return apiRequest<Property[]>('/api/properties');
    },
  });

  // Parar a animação de carregamento quando os dados forem carregados
  useEffect(() => {
    if (!isLoadingProperties && !isLoadingConfig) {
      stopLoading();
    }
  }, [isLoadingProperties, isLoadingConfig, stopLoading]);

  // Filtrar os imóveis de acordo com os filtros selecionados
  const filteredProperties = properties?.filter(property => {
    // Filtro por texto (título ou endereço)
    const searchMatch = !filters.search || 
      property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.address.toLowerCase().includes(filters.search.toLowerCase());
      
    // Filtro por tipo de imóvel
    const typeMatch = filters.propertyType === 'all' || property.type === filters.propertyType;
    
    // Filtro por quartos
    const bedroomsMatch = filters.bedrooms === 'any-bedrooms' || 
      (filters.bedrooms === '4+' ? (property.bedrooms || 0) >= 4 : (property.bedrooms || 0) === parseInt(filters.bedrooms));
    
    // Filtro por banheiros
    const bathroomsMatch = filters.bathrooms === 'any-bathrooms' || 
      (filters.bathrooms === '4+' ? (property.bathrooms || 0) >= 4 : (property.bathrooms || 0) === parseInt(filters.bathrooms));
    
    // Filtro por preço
    const priceMatch = property.price >= filters.minPrice && property.price <= filters.maxPrice;
    
    // Filtro por finalidade (venda/aluguel)
    const purposeMatch = filters.purpose === 'all-purposes' || property.purpose === filters.purpose;
    
    // Filtro por área
    const areaMatch = filters.area === 'any-area' || 
      (filters.area === '200+' ? property.area >= 200 : 
       filters.area === '150-200' ? (property.area >= 150 && property.area < 200) :
       filters.area === '100-150' ? (property.area >= 100 && property.area < 150) :
       filters.area === '50-100' ? (property.area >= 50 && property.area < 100) :
       property.area < 50);
    
    return searchMatch && typeMatch && bedroomsMatch && bathroomsMatch && priceMatch && purposeMatch && areaMatch;
  })?.sort((a, b) => {
    // Aplicar ordenação de acordo com o critério selecionado
    if (sortOrder === 'price_asc') {
      return a.price - b.price;
    } else if (sortOrder === 'price_desc') {
      return b.price - a.price;
    } else if (sortOrder === 'area_asc') {
      return a.area - b.area;
    } else if (sortOrder === 'area_desc') {
      return b.area - a.area;
    } else if (sortOrder === 'newest') {
      // Como não temos um campo de data, vamos utilizar o ID como referência
      // assumindo que IDs maiores são de propriedades mais recentes
      return b.id - a.id;
    }
    // Para "most_relevant" ou qualquer outro valor, não alteramos a ordem
    return 0;
  });

  // Abrir modal de detalhes do imóvel
  const openPropertyModal = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setIsModalOpen(true);
  };

  // Fechar modal de detalhes do imóvel
  const closePropertyModal = () => {
    setIsModalOpen(false);
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: 'all',
      bedrooms: 'any-bedrooms',
      bathrooms: 'any-bathrooms',
      minPrice: 0,
      maxPrice: 20000000,
      purpose: 'all-purposes',
      area: 'any-area'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header config={config} isLoadingConfig={isLoadingConfig} />
      
      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          
          {/* Filtros - Estilo Aprimorado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
            
            {/* Filtros com layout adaptativo para mobile */}
            <div className="p-4">
              {/* Campo de busca sempre em largura completa no topo para melhor usabilidade */}
              <div className="w-full mb-4">
                <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Busca</div>
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                  <Input
                    id="search"
                    className="h-10 pl-9 border-gray-300 rounded-lg w-full"
                    placeholder="Endereço, bairro ou cidade"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>
              
              {/* Grid responsivo para os filtros - quebra automaticamente em diferentes tamanhos de tela */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Finalidade (Comprar/Alugar) */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Finalidade</div>
                  <Select 
                    value={filters.purpose} 
                    onValueChange={(value) => setFilters({...filters, purpose: value})}
                  >
                    <SelectTrigger className="h-10 w-full border-gray-300 rounded-lg">
                      <div className="flex items-center">
                        <i className="fas fa-home mr-2 text-gray-400 text-sm"></i>
                        <SelectValue placeholder="Finalidade" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-purposes">Comprar ou Alugar</SelectItem>
                      <SelectItem value="sale">Comprar</SelectItem>
                      <SelectItem value="rent">Alugar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Tipo de imóvel */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Tipo</div>
                  <Select 
                    value={filters.propertyType} 
                    onValueChange={(value) => setFilters({...filters, propertyType: value})}
                  >
                    <SelectTrigger id="propertyType" className="h-10 w-full border-gray-300 rounded-lg">
                      <div className="flex items-center">
                        <i className="fas fa-building mr-2 text-gray-400 text-sm"></i>
                        <SelectValue placeholder="Tipo de imóvel" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="apartment">Apartamento</SelectItem>
                      <SelectItem value="condo">Condomínio</SelectItem>
                      <SelectItem value="land">Terreno</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Quartos */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Quartos</div>
                  <Select 
                    value={filters.bedrooms} 
                    onValueChange={(value) => setFilters({...filters, bedrooms: value})}
                  >
                    <SelectTrigger id="bedrooms" className="h-10 w-full border-gray-300 rounded-lg">
                      <div className="flex items-center">
                        <i className="fas fa-bed mr-2 text-gray-400 text-sm"></i>
                        <SelectValue placeholder="Quartos" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any-bedrooms">Qualquer</SelectItem>
                      <SelectItem value="1">1+ quartos</SelectItem>
                      <SelectItem value="2">2+ quartos</SelectItem>
                      <SelectItem value="3">3+ quartos</SelectItem>
                      <SelectItem value="4+">4+ quartos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Banheiros */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Banheiros</div>
                  <Select 
                    value={filters.bathrooms} 
                    onValueChange={(value) => setFilters({...filters, bathrooms: value})}
                  >
                    <SelectTrigger id="bathrooms" className="h-10 w-full border-gray-300 rounded-lg">
                      <div className="flex items-center">
                        <i className="fas fa-shower mr-2 text-gray-400 text-sm"></i>
                        <SelectValue placeholder="Banheiros" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any-bathrooms">Qualquer</SelectItem>
                      <SelectItem value="1">1+ banheiros</SelectItem>
                      <SelectItem value="2">2+ banheiros</SelectItem>
                      <SelectItem value="3">3+ banheiros</SelectItem>
                      <SelectItem value="4+">4+ banheiros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Área */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Área</div>
                  <Select 
                    value={filters.area} 
                    onValueChange={(value) => setFilters({...filters, area: value})}
                  >
                    <SelectTrigger id="area" className="h-10 w-full border-gray-300 rounded-lg">
                      <div className="flex items-center">
                        <i className="fas fa-ruler-combined mr-2 text-gray-400 text-sm"></i>
                        <SelectValue placeholder="Área" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any-area">Qualquer área</SelectItem>
                      <SelectItem value="0-50">Até 50m²</SelectItem>
                      <SelectItem value="50-100">50-100m²</SelectItem>
                      <SelectItem value="100-150">100-150m²</SelectItem>
                      <SelectItem value="150-200">150-200m²</SelectItem>
                      <SelectItem value="200+">Acima de 200m²</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Limpar filtros - botão estilizado - agora é parte do grid responsivo */}
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="h-10 w-full border-gray-300 rounded-lg hover:bg-gray-50" 
                    onClick={clearFilters}
                  >
                    <i className="fas fa-redo-alt mr-2 text-gray-500"></i>
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Slider de preço com design responsivo */}
            <div className="px-4 sm:px-5 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                <div className="text-sm font-medium">Faixa de Preço</div>
                <div className="text-sm font-bold" style={{ color: config?.primaryColor || 'var(--primary)' }}>
                  {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
                </div>
              </div>
              <PriceRangeSlider
                min={0}
                max={20000000}
                step={100000}
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={(value: number[]) => setFilters({...filters, minPrice: value[0], maxPrice: value[1]})}
                className="py-2 group"
                style={{ 
                  "--thumb-bg": config?.primaryColor || 'var(--primary)',
                  "--range-bg": config?.primaryColor || 'var(--primary)',
                } as React.CSSProperties }
              />
              <div className="grid grid-cols-3 sm:flex sm:justify-between text-xs text-gray-500 mt-1">
                <span>R$ 0</span>
                <span className="text-center">R$ 5M</span>
                <span className="text-right sm:text-left">R$ 10M</span>
                <span className="hidden sm:inline">R$ 15M</span>
                <span className="hidden sm:inline">R$ 20M</span>
              </div>
            </div>
            
            {/* Ordenação e contagem de resultados com design responsivo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 border-t border-gray-200 gap-3">
              <div className="text-sm flex items-center">
                <i className="fas fa-list-ul mr-2 text-gray-500"></i>
                <span className="font-medium">{filteredProperties?.length || 0}</span>
                <span className="text-gray-500 ml-1">imóveis encontrados</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center">
                  <i className="fas fa-sort text-gray-500 mr-1.5"></i>
                  <span className="text-sm text-gray-500 mr-2">Ordenar por:</span>
                </div>
                <Select 
                  value={sortOrder}
                  onValueChange={setSortOrder}
                >
                  <SelectTrigger className="h-9 text-sm w-full sm:w-auto min-w-[180px] border-gray-300 rounded-lg">
                    <SelectValue placeholder="Mais relevantes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most_relevant">Mais relevantes</SelectItem>
                    <SelectItem value="price_asc">Menor preço</SelectItem>
                    <SelectItem value="price_desc">Maior preço</SelectItem>
                    <SelectItem value="area_asc">Menor área</SelectItem>
                    <SelectItem value="area_desc">Maior área</SelectItem>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Resultados da busca */}
          {isLoadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  {/* Skeleton da imagem */}
                  <Skeleton className="h-52 w-full" />
                  {/* Skeleton das informações */}
                  <div className="p-4">
                    <Skeleton className="h-7 w-36 mb-3" /> {/* Preço */}
                    <Skeleton className="h-6 w-4/5 mb-2" /> {/* Título */}
                    <Skeleton className="h-4 w-full mb-4" /> {/* Endereço */}
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-4 w-20" /> {/* Quarto */}
                      <Skeleton className="h-4 w-20" /> {/* Banheiro */}
                      <Skeleton className="h-4 w-20" /> {/* Vagas */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Grid de imóveis com design aprimorado */}
              {filteredProperties && filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProperties.map((property) => (
                    <div 
                      key={property.id} 
                      className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer relative"
                      onClick={() => openPropertyModal(property.id)}
                    >
                      {/* Property Image */}
                      <div className="property-image-container h-48 bg-gray-200 relative overflow-hidden">
                        {getFeaturedImage(property) ? (
                          <img 
                            src={getFeaturedImage(property)} 
                            alt={property.title} 
                            className="property-image w-full h-full object-cover transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : null}
                        {/* Botão Ver Detalhes que aparece no hover */}
                        <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                          <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                            <i className="fas fa-eye text-sm" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                            <span className="text-sm font-medium" style={{ color: config?.primaryColor || 'var(--primary)' }}>Ver Detalhes</span>
                          </div>
                        </div>
                        <div 
                          className="absolute bottom-0 left-0 text-white px-3 py-1 rounded-tr-lg"
                          style={{
                            backgroundColor: config?.primaryColor || 'var(--primary)'
                          }}
                        >
                          {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-md mb-1 line-clamp-1">{property.title}</h3>
                        <div className="flex justify-start items-center mb-2">
                          <div 
                            className="text-lg font-bold text-gray-700"
                          >
                            R$ {property.price.toLocaleString('pt-BR')}
                            {property.purpose === 'rent' && <span className="text-xs font-normal text-gray-500">/mês</span>}
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-1">{property.address}</p>
                        
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <i className="fas fa-ruler-combined fa-sm mr-1"></i>
                            {property.area}m²
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-bed fa-sm mr-1"></i>
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-shower fa-sm mr-1"></i>
                            {property.bathrooms}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-bath fa-sm mr-1" style={{ color: config?.primaryColor || 'var(--primary)' }}></i>
                            {property.suites || 0}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-car fa-sm mr-1"></i>
                            {property.parkingSpots || 0}
                          </span>
                        </div>
                      </div>
                      
                      {/* Overlay de hover para indicar que é clicável */}
                      <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-5"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-6">
                    <i className="fas fa-search text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-700 mb-3">Nenhum imóvel encontrado</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Não encontramos imóveis que correspondam aos seus critérios de busca. 
                    Tente ajustar os filtros para ver mais resultados.
                  </p>
                  <Button 
                    onClick={clearFilters}
                    style={{ 
                      backgroundColor: config?.primaryColor || 'var(--primary)',
                    }}
                    className="px-6 py-2.5"
                  >
                    <i className="fas fa-redo-alt mr-2"></i>
                    Limpar Todos os Filtros
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Footer simples */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Imobiliária. Todos os direitos reservados.</p>
        </div>
      </footer>
      
      {/* Modal de detalhes do imóvel */}
      {isModalOpen && selectedPropertyId && (
        <PropertyDetailsModal 
          propertyId={selectedPropertyId}
          isOpen={isModalOpen}
          onClose={closePropertyModal}
        />
      )}
    </div>
  );
}