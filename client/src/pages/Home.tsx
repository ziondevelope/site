import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  const { data: config, isLoading: isLoadingConfig } = useQuery<any>({
    queryKey: ['/api/website/config'],
    queryFn: async () => {
      const response = await apiRequest('/api/website/config');
      return response;
    },
  });

  const { data: properties, isLoading: isLoadingProperties } = useQuery<any[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await apiRequest('/api/properties');
      return response;
    },
  });

  const handleAdminLogin = () => {
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white">
              <i className="ri-home-line text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{isLoadingConfig ? "Imobiliária" : config?.mainFont || "Imobiliária"}</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-primary">Início</a>
            <a href="#properties" className="text-gray-700 hover:text-primary">Imóveis</a>
            <a href="#about" className="text-gray-700 hover:text-primary">Sobre</a>
            <a href="#contact" className="text-gray-700 hover:text-primary">Contato</a>
          </nav>
          <div>
            <Button onClick={handleAdminLogin} variant="outline" className="ml-4">
              Área do Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-r from-blue-600 to-primary py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Encontre o imóvel dos seus sonhos</h1>
            <p className="text-lg mb-8">Oferecemos as melhores opções de imóveis para compra e aluguel com atendimento personalizado.</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="default" size="lg" className="bg-white text-primary hover:bg-gray-100">
                Ver imóveis
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Agendar visita
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="properties" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Imóveis em Destaque</h2>
          
          {isLoadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(item => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties?.slice(0, 6).map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                  {/* Property Image */}
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute bottom-0 left-0 bg-primary text-white px-3 py-1 rounded-tr-lg">
                      {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                    <p className="text-gray-500 mb-4">{property.address}</p>
                    
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center">
                        <i className="ri-ruler-line mr-1 text-primary"></i>
                        <span>{property.area} m²</span>
                      </div>
                      <div className="flex items-center">
                        <i className="ri-hotel-bed-line mr-1 text-primary"></i>
                        <span>{property.bedrooms} quartos</span>
                      </div>
                      <div className="flex items-center">
                        <i className="ri-shower-line mr-1 text-primary"></i>
                        <span>{property.bathrooms} banheiros</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary">
                        R$ {property.price.toLocaleString('pt-BR')}
                        {property.purpose === 'rent' && <span className="text-sm font-normal text-gray-500">/mês</span>}
                      </div>
                      <Button variant="outline" size="sm">Ver detalhes</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Ver todos os imóveis
              <i className="ri-arrow-right-line ml-2"></i>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gray-200 h-96 rounded-lg"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Sobre a Imobiliária</h2>
              <p className="text-gray-600 mb-6">
                Nossa imobiliária atua no mercado há mais de 15 anos, oferecendo as melhores opções de imóveis para nossos clientes. 
                Contamos com uma equipe de corretores especializados prontos para encontrar o imóvel ideal para você.
              </p>
              <p className="text-gray-600 mb-8">
                Trabalhamos com imóveis residenciais e comerciais, tanto para compra quanto para locação. 
                Nosso objetivo é proporcionar uma experiência tranquila e segura em todas as etapas da negociação.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="ri-check-line text-primary text-xl mr-2"></i>
                  <span>Atendimento personalizado</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-primary text-xl mr-2"></i>
                  <span>Assessoria jurídica completa</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-primary text-xl mr-2"></i>
                  <span>Corretores experientes</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-primary text-xl mr-2"></i>
                  <span>Parceria com os principais bancos</span>
                </li>
              </ul>
              <Button>Conheça nossa equipe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Entre em contato</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                <Button type="submit" className="w-full">Enviar mensagem</Button>
              </form>
            </div>
            
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Informações de contato</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <i className="ri-map-pin-line text-primary text-xl mr-3 mt-1"></i>
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-gray-600">Av. Paulista, 1000 - São Paulo, SP</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-phone-line text-primary text-xl mr-3 mt-1"></i>
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-gray-600">(11) 3333-4444</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-mail-line text-primary text-xl mr-3 mt-1"></i>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">contato@imobiliaria.com.br</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-time-line text-primary text-xl mr-3 mt-1"></i>
                    <div>
                      <p className="font-medium">Horário de funcionamento</p>
                      <p className="text-gray-600">Segunda a Sexta: 9h às 18h</p>
                      <p className="text-gray-600">Sábados: 9h às 13h</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Siga-nos</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-600 hover:text-primary text-2xl">
                    <i className="ri-facebook-circle-fill"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-primary text-2xl">
                    <i className="ri-instagram-fill"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-primary text-2xl">
                    <i className="ri-linkedin-box-fill"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-primary text-2xl">
                    <i className="ri-youtube-fill"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white">
                  <i className="ri-home-line text-xl"></i>
                </div>
                <h1 className="text-2xl font-bold">Imobiliária</h1>
              </div>
              <p className="text-gray-400 mb-6">
                Soluções imobiliárias completas para você encontrar o imóvel dos seus sonhos.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="ri-facebook-circle-fill"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="ri-instagram-fill"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="ri-linkedin-box-fill"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <i className="ri-youtube-fill"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Links Rápidos</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">Início</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Imóveis</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Tipos de Imóveis</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">Apartamentos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Casas</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terrenos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Comerciais</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Rurais</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="ri-map-pin-line text-primary mr-3 mt-1"></i>
                  <span className="text-gray-400">Av. Paulista, 1000 - São Paulo, SP</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-phone-line text-primary mr-3 mt-1"></i>
                  <span className="text-gray-400">(11) 3333-4444</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-mail-line text-primary mr-3 mt-1"></i>
                  <span className="text-gray-400">contato@imobiliaria.com.br</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Imobiliária. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}