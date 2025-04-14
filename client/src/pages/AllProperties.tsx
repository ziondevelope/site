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
import { Slider } from '@/components/ui/slider';

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
  
  // Estados para os filtros
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'all',
    bedrooms: 'any-bedrooms',
    bathrooms: 'any-bathrooms',
    minPrice: 0,
    maxPrice: 10000000,
    purpose: 'all-purposes',
    area: 'any-area'
  });

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
      maxPrice: 10000000,
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
          <h1 className="text-3xl font-bold mb-8">Todos os Imóveis</h1>
          
          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {/* Busca por texto */}
              <div>
                <Label htmlFor="search" className="mb-1 block">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Buscar por título ou endereço"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
              
              {/* Tipo de imóvel */}
              <div>
                <Label htmlFor="propertyType" className="mb-1 block">Tipo</Label>
                <Select 
                  value={filters.propertyType} 
                  onValueChange={(value) => setFilters({...filters, propertyType: value})}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="condo">Condomínio</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Número de quartos */}
              <div>
                <Label htmlFor="bedrooms" className="mb-1 block">Quartos</Label>
                <Select 
                  value={filters.bedrooms} 
                  onValueChange={(value) => setFilters({...filters, bedrooms: value})}
                >
                  <SelectTrigger id="bedrooms">
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any-bedrooms">Qualquer</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Número de banheiros */}
              <div>
                <Label htmlFor="bathrooms" className="mb-1 block">Banheiros</Label>
                <Select 
                  value={filters.bathrooms} 
                  onValueChange={(value) => setFilters({...filters, bathrooms: value})}
                >
                  <SelectTrigger id="bathrooms">
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any-bathrooms">Qualquer</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Finalidade (venda/aluguel) */}
              <div>
                <Label htmlFor="purpose" className="mb-1 block">Finalidade</Label>
                <Select 
                  value={filters.purpose} 
                  onValueChange={(value) => setFilters({...filters, purpose: value})}
                >
                  <SelectTrigger id="purpose">
                    <SelectValue placeholder="Venda ou Aluguel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-purposes">Todos</SelectItem>
                    <SelectItem value="sale">Venda</SelectItem>
                    <SelectItem value="rent">Aluguel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Área */}
              <div>
                <Label htmlFor="area" className="mb-1 block">Área</Label>
                <Select 
                  value={filters.area} 
                  onValueChange={(value) => setFilters({...filters, area: value})}
                >
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Qualquer tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any-area">Qualquer</SelectItem>
                    <SelectItem value="0-50">Até 50m²</SelectItem>
                    <SelectItem value="50-100">50-100m²</SelectItem>
                    <SelectItem value="100-150">100-150m²</SelectItem>
                    <SelectItem value="150-200">150-200m²</SelectItem>
                    <SelectItem value="200+">Acima de 200m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Faixa de preço */}
              <div className="lg:col-span-2">
                <Label className="mb-1 block">Faixa de Preço: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}</Label>
                <div className="px-2 pt-2 pb-6">
                  <Slider
                    min={0}
                    max={10000000}
                    step={50000}
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={(value) => setFilters({...filters, minPrice: value[0], maxPrice: value[1]})}
                  />
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
            </div>
          </div>
          
          {/* Resultados da busca */}
          {isLoadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between mb-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Contagem de resultados */}
              <p className="mb-6 font-medium text-gray-700">
                {filteredProperties?.length || 0} imóveis encontrados
              </p>
              
              {/* Grid de imóveis */}
              {filteredProperties && filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProperties.map((property) => (
                    <div 
                      key={property.id} 
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg"
                    >
                      {/* Imagem do imóvel */}
                      <div className="h-48 bg-gray-100 relative overflow-hidden">
                        {getFeaturedImage(property) ? (
                          <img 
                            src={getFeaturedImage(property)} 
                            alt={property.title} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
                            <i className="fas fa-home text-3xl"></i>
                          </div>
                        )}
                        <div 
                          className="absolute bottom-0 left-0 text-white px-3 py-1 rounded-tr-lg"
                          style={{
                            backgroundColor: config?.primaryColor || 'var(--primary)'
                          }}
                        >
                          {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                        </div>
                      </div>
                      
                      {/* Informações do imóvel */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{property.title}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-1">{property.address}</p>
                        
                        {/* Características do imóvel */}
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <i className="fas fa-ruler-combined fa-sm mr-1"></i>
                            {property.area}m²
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-bed fa-sm mr-1"></i>
                            {property.bedrooms || 0}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-shower fa-sm mr-1"></i>
                            {property.bathrooms || 0}
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
                        
                        {/* Preço e botão */}
                        <div className="flex justify-between items-center">
                          <div 
                            className="text-xl font-bold"
                            style={{ color: config?.primaryColor || 'var(--primary)' }}
                          >
                            R$ {property.price.toLocaleString('pt-BR')}
                            {property.purpose === 'rent' && <span className="text-xs font-normal text-gray-500">/mês</span>}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openPropertyModal(property.id)}
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum imóvel encontrado</h3>
                  <p className="text-gray-500 mb-6">Tente ajustar os filtros para ver mais resultados</p>
                  <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
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