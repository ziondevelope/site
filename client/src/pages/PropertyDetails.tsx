import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Property } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function PropertyDetails() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id
  });

  // Fetch website configuration
  const { data: config } = useQuery({
    queryKey: ['/api/website/config']
  });

  // Set the first image as active when property data is loaded
  useEffect(() => {
    if (property?.images && property.images.length > 0) {
      const featuredImage = property.images.find(img => img.isFeatured);
      setActiveImage(featuredImage ? featuredImage.url : property.images[0].url);
    }
  }, [property]);

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Get feature icons
  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, string> = {
      'Piscina': 'ri-water-flash-line',
      'Academia': 'ri-boxing-line',
      'Churrasqueira': 'ri-fire-line',
      'Pet friendly': 'ri-dog-line',
      'Segurança 24h': 'ri-shield-check-line',
      'Playground': 'ri-gamepad-line',
      'Estacionamento': 'ri-parking-line',
      'Elevador': 'ri-arrow-up-down-line',
      'Wi-Fi': 'ri-wifi-line',
      'Área de lazer': 'ri-landscape-line',
      'Ar condicionado': 'ri-temp-cold-line',
      'Quadra': 'ri-basketball-line',
      'Salão de festas': 'ri-party-line',
      'Varanda': 'ri-home-8-line',
      'Área gourmet': 'ri-restaurant-line',
    };
    
    return icons[feature] || 'ri-checkbox-circle-line';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header com navegação de volta */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white">
                  <i className="ri-arrow-left-line text-xl"></i>
                </div>
                <span className="text-gray-700 font-medium">Voltar para Imóveis</span>
              </div>
            </Link>
          </div>
          <div>
            <Link href="/admin">
              <Button variant="outline" className="ml-4">
                Área do Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-grow">
        {isLoadingProperty ? (
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-gray-200 h-96 rounded-lg mb-4"></div>
                  <div className="flex space-x-2 overflow-x-auto">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-gray-200 w-24 h-16 rounded-md flex-shrink-0"></div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        ) : property ? (
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{property.title}</h1>
              <div 
                className="text-3xl font-bold mt-2 md:mt-0"
                style={{ color: config?.primaryColor || 'var(--primary)' }}
              >
                {formatCurrency(property.price)}
                {property.purpose === 'rent' && <span className="text-base font-normal text-gray-500">/mês</span>}
              </div>
            </div>
            
            {/* Endereço */}
            <div className="flex items-center mb-8 text-gray-600">
              <i className="ri-map-pin-line mr-2 text-lg"></i>
              <span>{property.address}</span>
            </div>
            
            {/* Galeria de Imagens - Ocupa toda a largura */}
            <div className="w-full mb-8">
              <div 
                className="h-96 bg-gray-100 rounded-lg mb-4 overflow-hidden relative"
                style={{ 
                  backgroundImage: activeImage ? `url(${activeImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Tag de propósito (venda/aluguel) */}
                <div 
                  className="absolute top-4 left-4 px-4 py-2 text-white rounded-md font-medium text-sm"
                  style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}
                >
                  {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                </div>
              </div>
              
              {/* Miniaturas */}
              {property.images && property.images.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {property.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`w-24 h-16 rounded-md flex-shrink-0 cursor-pointer border-2 overflow-hidden ${
                        activeImage === image.url ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setActiveImage(image.url)}
                      style={{
                        borderColor: activeImage === image.url ? 
                          (config?.primaryColor || 'var(--primary)') : 'transparent'
                      }}
                    >
                      <img 
                        src={image.url} 
                        alt={`Imagem ${index + 1} do imóvel`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
              
            {/* Card de Detalhes - Abaixo das imagens */}
            <div className="w-full bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Detalhes do Imóvel</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Área</span>
                  <div className="flex items-center mt-1">
                    <i 
                      className="ri-ruler-line mr-2 text-lg"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <span className="font-medium">{property.area} m²</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Quartos</span>
                  <div className="flex items-center mt-1">
                    <i 
                      className="ri-hotel-bed-line mr-2 text-lg"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <span className="font-medium">{property.bedrooms || 0}</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Banheiros</span>
                  <div className="flex items-center mt-1">
                    <i 
                      className="ri-shower-line mr-2 text-lg"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <span className="font-medium">{property.bathrooms || 0}</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Suítes</span>
                  <div className="flex items-center mt-1">
                    <i 
                      className="ri-shut-down-line mr-2 text-lg"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <span className="font-medium">{property.suites || 0}</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Vagas</span>
                  <div className="flex items-center mt-1">
                    <i 
                      className="ri-car-line mr-2 text-lg"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <span className="font-medium">{property.parkingSpots || 0}</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Tipo</span>
                  <div className="flex items-center mt-1">
                    <i 
                      className="ri-home-line mr-2 text-lg"
                      style={{ color: config?.primaryColor || 'var(--primary)' }}
                    ></i>
                    <span className="font-medium capitalize">{property.type}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conteúdo separado em duas colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Descrição */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Descrição</h2>
                  <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
                </div>
                
                {/* Características */}
                {property.features && property.features.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Características</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <i 
                            className={`${getFeatureIcon(feature)} mr-2 text-lg`}
                            style={{ color: config?.primaryColor || 'var(--primary)' }}
                          ></i>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar com formulário */}
              <div>
                {/* Card de Contato */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold mb-4">Interessado?</h3>
                  <p className="text-gray-600 mb-4">
                    Preencha o formulário abaixo para entrar em contato com um de nossos corretores.
                  </p>
                  
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <input
                        type="text"
                        placeholder="Seu nome"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Seu email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Seu telefone"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Mensagem"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        defaultValue={`Olá, tenho interesse no imóvel ${property.title} (Ref: #${property.id}).`}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-3 rounded-md font-medium text-white"
                      style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}
                    >
                      Enviar Mensagem
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Imóvel não encontrado</h2>
            <p className="text-gray-600 mb-8">O imóvel que você está procurando não está disponível.</p>
            <Link href="/">
              <Button variant="default" size="lg">
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Imobiliária. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}