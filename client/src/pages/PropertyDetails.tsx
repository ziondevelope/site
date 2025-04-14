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

  // Propriedade atual visual
  const currentProperty = property;
  const primaryColor = config?.primaryColor || 'var(--primary)';

  // Estado para controlar o carregamento do logo
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - Mesmo da página principal */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {isLoadingProperty ? (
              // Placeholder durante o carregamento - mantém o mesmo tamanho
              <div className="h-12 w-28 bg-gray-100 rounded animate-pulse"></div>
            ) : config?.logo ? (
              <div className="h-12 min-w-[112px]">
                <img 
                  src={config.logo} 
                  alt="Logo da Imobiliária" 
                  className="h-full object-contain"
                  loading="eager" 
                  onLoad={(e) => {
                    // Torna a imagem visível quando carregada
                    (e.target as HTMLImageElement).style.opacity = "1";
                    setLogoLoaded(true);
                  }}
                  style={{ opacity: 0, transition: "opacity 0.2s ease" }}
                />
              </div>
            ) : (
              <>
                <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white">
                  <i className="ri-home-line text-xl"></i>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Imobiliária</h1>
              </>
            )}
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className="text-gray-700 hover:text-primary cursor-pointer">Início</span>
            </Link>
            <Link href="/#properties">
              <span className="text-gray-700 hover:text-primary cursor-pointer">Imóveis</span>
            </Link>
            <Link href="/#about">
              <span className="text-gray-700 hover:text-primary cursor-pointer">Sobre</span>
            </Link>
            <Link href="/#contact">
              <span className="text-gray-700 hover:text-primary cursor-pointer">Contato</span>
            </Link>
          </nav>
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
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
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
            </div>
          </div>
        ) : currentProperty ? (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Navegação e código */}
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
                <div className="flex items-center text-sm">
                  <span className="text-gray-500">Ref: <span className="font-medium text-gray-700">#{currentProperty.id}</span></span>
                </div>
              </div>
              
              {/* Layout de duas colunas principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna da esquerda - Conteúdo principal */}
                <div className="lg:col-span-2">
                  {/* Endereço e compartilhar */}
                  <div className="flex flex-wrap justify-between mb-6">
                    <div className="flex items-center text-gray-600 mb-2 md:mb-0">
                      <i className="ri-map-pin-line mr-2 text-lg" style={{ color: primaryColor }}></i>
                      <span>{currentProperty.address}</span>
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <div className="px-3 py-1 text-white text-sm font-medium rounded-md" 
                          style={{ backgroundColor: primaryColor }}>
                          {currentProperty.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                        </div>
                      </div>
                      
                      <button className="flex items-center text-gray-500 hover:text-primary">
                        <i className="ri-share-line mr-1"></i>
                        <span className="text-sm">Compartilhar</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Imagem Principal */}
                  <div 
                    className="w-full h-[500px] rounded-xl mb-2 overflow-hidden relative bg-cover bg-center"
                    style={{ 
                      backgroundImage: activeImage ? `url(${activeImage})` : 'none',
                    }}
                  >
                    {!activeImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <i className="ri-image-line text-4xl text-gray-400"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Miniaturas */}
                  {currentProperty.images && currentProperty.images.length > 0 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
                      {currentProperty.images.map((image, index) => (
                        <div 
                          key={index}
                          className="w-28 h-20 rounded-md flex-shrink-0 cursor-pointer overflow-hidden"
                          onClick={() => setActiveImage(image.url)}
                        >
                          <img 
                            src={image.url} 
                            alt={`Imagem ${index + 1} do imóvel`}
                            className={`w-full h-full object-cover transition-all ${
                              activeImage === image.url ? 'ring-2 ring-offset-2 ring-primary' : 'filter brightness-75 hover:brightness-100'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Título e preço - Agora abaixo da foto no estilo da página principal */}
                  <div className="mb-6 bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-100">
                      <div className="flex flex-wrap items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mr-4">{currentProperty.title}</h1>
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
                    </div>
                    <div className="px-6 py-4 bg-gray-50">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center mr-3">
                          <i className="ri-home-4-line mr-1"></i>
                          <span>{currentProperty.type && currentProperty.type.charAt(0).toUpperCase() + currentProperty.type.slice(1)}</span>
                        </span>
                        <span className="inline-flex items-center mr-3">
                          <i className="ri-map-pin-line mr-1"></i>
                          <span>{currentProperty.neighborhood || 'Centro'}</span>
                        </span>
                        <span className="inline-flex items-center">
                          <i className="ri-code-line mr-1"></i>
                          <span>Ref: #{currentProperty.id}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Destaque dos detalhes principais */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <i className="ri-ruler-line text-2xl mb-2" style={{ color: primaryColor }}></i>
                      <span className="text-sm text-gray-500">Área</span>
                      <span className="font-medium text-gray-800">{currentProperty.area} m²</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <i className="ri-hotel-bed-line text-2xl mb-2" style={{ color: primaryColor }}></i>
                      <span className="text-sm text-gray-500">Quartos</span>
                      <span className="font-medium text-gray-800">{currentProperty.bedrooms || 0}</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <i className="ri-shower-line text-2xl mb-2" style={{ color: primaryColor }}></i>
                      <span className="text-sm text-gray-500">Banheiros</span>
                      <span className="font-medium text-gray-800">{currentProperty.bathrooms || 0}</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <i className="ri-shut-down-line text-2xl mb-2" style={{ color: primaryColor }}></i>
                      <span className="text-sm text-gray-500">Suítes</span>
                      <span className="font-medium text-gray-800">{currentProperty.suites || 0}</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <i className="ri-car-line text-2xl mb-2" style={{ color: primaryColor }}></i>
                      <span className="text-sm text-gray-500">Vagas</span>
                      <span className="font-medium text-gray-800">{currentProperty.parkingSpots || 0}</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <i className="ri-home-line text-2xl mb-2" style={{ color: primaryColor }}></i>
                      <span className="text-sm text-gray-500">Tipo</span>
                      <span className="font-medium text-gray-800 capitalize">{currentProperty.type}</span>
                    </div>
                  </div>
                  
                  {/* Descrição */}
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-2xl font-bold mb-4">Descrição</h2>
                    <p className="text-gray-600 whitespace-pre-line">{currentProperty.description}</p>
                  </div>
                  
                  {/* Características */}
                  {currentProperty.features && currentProperty.features.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                      <h2 className="text-2xl font-bold mb-4">Características</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                        {currentProperty.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                              style={{ backgroundColor: `${primaryColor}15` }}>
                              <i 
                                className={`${getFeatureIcon(feature)} text-lg`}
                                style={{ color: primaryColor }}
                              ></i>
                            </div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Localização */}
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-2xl font-bold mb-4">Localização</h2>
                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center">
                        <i className="ri-map-pin-line text-4xl mb-2 text-gray-400"></i>
                        <p className="text-gray-500">Mapa indisponível</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Propriedades relacionadas / sugestões */}
                  <div className="mb-8 lg:mb-0">
                    <h2 className="text-2xl font-bold mb-6">Imóveis similares</h2>
                    <div className="relative">
                      <div className="flex overflow-x-auto space-x-4 pb-4">
                        {/* Placeholders para imóveis similares */}
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex-shrink-0 w-72">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <div className="h-48 bg-gray-200 relative">
                                <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                                  Verificar disponibilidade
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 truncate">Imóvel similar</h3>
                                <p className="text-gray-500 text-sm mb-2">Localização</p>
                                <div className="flex justify-between items-center">
                                  <div className="font-bold" style={{ color: primaryColor }}>
                                    Consultar
                                  </div>
                                  <div className="flex space-x-2 text-gray-500 text-sm">
                                    <span><i className="ri-hotel-bed-line"></i> 3</span>
                                    <span><i className="ri-shower-line"></i> 2</span>
                                    <span><i className="ri-car-line"></i> 1</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Coluna da direita - Formulário de contato */}
                <div>
                  <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-2">Interessado neste imóvel?</h3>
                      <p className="text-gray-600">
                        Entre em contato com um de nossos corretores
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <button 
                        className="w-full py-3 px-4 rounded-md font-medium text-white flex items-center justify-center"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <i className="ri-whatsapp-line mr-2 text-lg"></i>
                        WhatsApp
                      </button>
                    </div>
                    
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
                          defaultValue={`Olá, tenho interesse no imóvel ${currentProperty.title} (Ref: #${currentProperty.id}).`}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 rounded-md font-medium text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Enviar Mensagem
                      </button>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4">
                          <img 
                            src="https://via.placeholder.com/48"
                            alt="Corretor" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Equipe LLImóveis</p>
                          <p className="text-sm text-gray-500">Entre em contato conosco</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-lg mx-auto text-center">
              <div className="mb-6 w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                <i className="ri-error-warning-line text-3xl text-red-500"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Imóvel não encontrado</h2>
              <p className="text-gray-600 mb-8">
                O imóvel que você está procurando não está disponível ou foi removido.
              </p>
              <Link href="/">
                <Button size="lg">
                  <i className="ri-home-4-line mr-2"></i>
                  Voltar para a página inicial
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-10 w-10 rounded text-white flex items-center justify-center" 
                  style={{ backgroundColor: primaryColor }}>
                  <i className="ri-home-4-line text-xl"></i>
                </div>
                <h3 className="text-xl font-bold">Imobiliária</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Encontrando o lar perfeito para você desde 2005.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-facebook-circle-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-instagram-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-youtube-fill text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-whatsapp-fill text-xl"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Início</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Imóveis</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Tipos de Imóveis</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Apartamentos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Casas</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terrenos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Comerciais</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Rurais</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="ri-map-pin-line mt-1 mr-2" style={{ color: primaryColor }}></i>
                  <span>Av. Paulista, 1000<br/>São Paulo, SP, Brasil</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-phone-line mr-2" style={{ color: primaryColor }}></i>
                  <span>(11) 3333-4444</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-mail-line mr-2" style={{ color: primaryColor }}></i>
                  <span>contato@imobiliaria.com.br</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-time-line mr-2" style={{ color: primaryColor }}></i>
                  <span>Seg-Sex: 9h às 18h</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">&copy; 2025 Imobiliária. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}