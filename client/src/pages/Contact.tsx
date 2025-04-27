import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WebsiteConfig, Property } from '@shared/schema';
// Using plain footer HTML elements instead of an imported component
// Create a simple inline header instead of using the imported component
import { Link } from 'wouter';
import { MapPin, Phone, Mail, Clock, Send, ChevronLeft, ChevronRight, Home, Map, Bed, Bath, Square, Car } from 'lucide-react';

// Property Carousel Component
const PropertyCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
  });
  
  const bgColor = config?.primaryColor || '#7f651e';
  
  // Para navegar para a página de detalhes do imóvel
  const openPropertyDetails = (id: number) => {
    window.location.href = `/properties/${id}`;
  };
  
  const scrollToNext = () => {
    if (!carouselRef.current || !properties) return;
    
    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1);
      carouselRef.current.scrollTo({
        left: (currentIndex + 1) * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };
  
  const scrollToPrevious = () => {
    if (!carouselRef.current || !properties) return;
    
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      carouselRef.current.scrollTo({
        left: (currentIndex - 1) * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  // Add CSS to hide scrollbar and add hover effects
  const customStyles = `
    .carousel-container::-webkit-scrollbar {
      display: none;
    }
    .carousel-container {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    /* Property card hover effects */
    .property-card:hover .eye-icon {
      opacity: 1;
    }
    
    .property-card:hover .property-image {
      transform: scale(1.05);
      transition: transform 0.5s ease;
    }
    
    .property-image {
      transition: transform 0.5s ease;
    }
  `;

  const [isDesktop, setIsDesktop] = useState(false);
  const totalItems = properties?.length || 0;
  const itemsPerPage = { mobile: 1, desktop: 4 };
  const maxIndexMobile = totalItems - itemsPerPage.mobile;
  const maxIndexDesktop = Math.max(0, totalItems - itemsPerPage.desktop);
  const maxScrollIndex = isDesktop ? maxIndexDesktop : maxIndexMobile;
  
  // Verificar tamanho da tela quando o componente montar
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    
    return () => {
      window.removeEventListener('resize', checkIfDesktop);
    };
  }, []);

  const scrollNext = () => {
    if (!carouselRef.current || !properties) return;
    
    if (currentIndex < maxScrollIndex) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      if (isDesktop) {
        // No desktop, cada card tem 25% da largura
        const containerWidth = carouselRef.current.offsetWidth;
        const scrollAmount = nextIndex * (containerWidth / 4);
        
        carouselRef.current.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      } else {
        // No mobile, scroll para o próximo item (100% da largura)
        carouselRef.current.scrollTo({
          left: nextIndex * carouselRef.current.offsetWidth,
          behavior: 'smooth'
        });
      }
    }
  };
  
  const scrollPrev = () => {
    if (!carouselRef.current || !properties) return;
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      
      if (isDesktop) {
        // No desktop, cada card tem 25% da largura
        const containerWidth = carouselRef.current.offsetWidth;
        const scrollAmount = prevIndex * (containerWidth / 4);
        
        carouselRef.current.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      } else {
        // No mobile, scroll para o item anterior (100% da largura)
        carouselRef.current.scrollTo({
          left: prevIndex * carouselRef.current.offsetWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: bgColor }}>Imóveis em Destaque</h2>
        
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            style={{ color: bgColor }}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={scrollNext}
            disabled={currentIndex >= maxScrollIndex}
            className={`p-2 rounded-full ${currentIndex >= maxScrollIndex ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            style={{ color: bgColor }}
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory carousel-container"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth'
        }}
      >
        {properties?.map((property, index) => (
          <div
            key={property.id}
            className="min-w-full md:min-w-[25%] w-full md:w-1/4 flex-shrink-0 snap-center px-1 md:px-2"
          >
            <div 
              className="property-card h-full bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer relative"
              onClick={() => openPropertyDetails(property.id)}>
              {/* Property Image */}
              <div className="property-image-container h-48 relative overflow-hidden">
                <img
                  src={property.images?.[0]?.url || '/placeholder-property.jpg'}
                  alt={property.title || 'Imóvel'}
                  className="property-image w-full h-full object-cover"
                />
                {/* Botão Ver Detalhes que aparece no hover */}
                <div className="eye-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
                  <div className="rounded-md bg-white/90 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                    <i className="fas fa-eye text-sm" style={{ color: bgColor }}></i>
                    <span className="text-sm font-medium" style={{ color: bgColor }}>Ver Detalhes</span>
                  </div>
                </div>
              </div>
              
              {/* Property Details */}
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2 truncate">{property.title || 'Imóvel sem título'}</h3>
                <p className="text-gray-600 text-sm mb-3 truncate">{property.neighborhood || property.city || property.address || 'Localização não informada'}</p>
                
                {/* Property Price */}
                <div className="text-lg font-bold mb-3" style={{ color: bgColor }}>
                  {formatPrice(property.price)}
                  {property.purpose === 'rent' && <span className="text-sm text-gray-600 font-normal">/mês</span>}
                </div>
                
                {/* Property Features */}
                <div className="flex items-center justify-between mt-2 text-gray-500 text-sm">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="mr-1 w-3.5 h-3.5" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="mr-1 w-3.5 h-3.5" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.area && (
                    <div className="flex items-center">
                      <Square className="mr-1 w-3.5 h-3.5" />
                      <span>{property.area}m²</span>
                    </div>
                  )}
                  {property.parkingSpots && (
                    <div className="flex items-center">
                      <Car className="mr-1 w-3.5 h-3.5" />
                      <span>{property.parkingSpots}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
  });

  const bgColor = config?.primaryColor || '#7f651e';
  const textColor = '#ffffff';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSending(true);
    setError('');

    try {
      // Simulating API call - in a real application, you would post data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSubject('');
      setSent(true);
      
      setTimeout(() => {
        setSent(false);
      }, 5000);
    } catch (error) {
      setError('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              {config?.logo ? (
                <img 
                  src={config.logo} 
                  alt="Logo" 
                  className="h-12 object-contain"
                />
              ) : (
                <div className="text-xl font-semibold" style={{ color: config?.primaryColor || '#7f651e' }}>
                  Imobiliária
                </div>
              )}
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
                Início
              </Link>
              <Link href="/properties" className="text-gray-700 hover:text-gray-900 font-medium">
                Imóveis
              </Link>
              <Link href="/contact" className="font-medium" style={{ color: config?.primaryColor || '#7f651e' }}>
                Contato
              </Link>
            </nav>
            
            <div className="md:hidden">
              <Link href="/" className="text-gray-700 hover:text-gray-900 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div 
          className="w-full bg-cover bg-center h-64 md:h-80 flex items-center justify-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${config?.bannerBackground || '/images/contact-bg.jpg'})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Entre em Contato</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto px-4">
              Estamos aqui para ajudar. Entre em contato conosco e responderemos o mais breve possível.
            </p>
          </div>
        </div>

        {/* Contact Details & Form Section */}
        <div className="container mx-auto py-16 px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: bgColor }}>
                  Informações de Contato
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: bgColor }} />
                    <div>
                      <h4 className="font-medium">Nosso Endereço</h4>
                      <p className="text-gray-600 mt-1">
                        {config?.address || 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-000'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: bgColor }} />
                    <div>
                      <h4 className="font-medium">Telefone</h4>
                      <p className="text-gray-600 mt-1">
                        {config?.phone || '(11) 9999-9999'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: bgColor }} />
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-gray-600 mt-1">
                        {config?.email || 'contato@imobiliaria.com.br'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: bgColor }} />
                    <div>
                      <h4 className="font-medium">Horário de Funcionamento</h4>
                      <p className="text-gray-600 mt-1">
                        Segunda à Sexta: 9h às 18h<br />
                        Sábado: 9h às 13h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              {(config?.facebookUrl || config?.instagramUrl || config?.linkedinUrl) && (
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: bgColor }}>
                    Redes Sociais
                  </h3>
                  <div className="flex space-x-4">
                    {config?.facebookUrl && (
                      <a 
                        href={config.facebookUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                        aria-label="Facebook"
                      >
                        <i className="fab fa-facebook-f text-white"></i>
                      </a>
                    )}
                    
                    {config?.instagramUrl && (
                      <a 
                        href={config.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                        aria-label="Instagram"
                      >
                        <i className="fab fa-instagram text-white"></i>
                      </a>
                    )}
                    
                    {config?.linkedinUrl && (
                      <a 
                        href={config.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                        aria-label="LinkedIn"
                      >
                        <i className="fab fa-linkedin-in text-white"></i>
                      </a>
                    )}

                    {config?.youtubeUrl && (
                      <a 
                        href={config.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: bgColor }}
                        aria-label="YouTube"
                      >
                        <i className="fab fa-youtube text-white"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: bgColor }}>
                Envie sua mensagem
              </h3>
              
              {sent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Mensagem enviada com sucesso! Entraremos em contato em breve.
                  </p>
                </div>
              ) : null}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo*
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none focus:ring-[#7f651e]"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      placeholder="Seu email"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      placeholder="Seu telefone"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Assunto
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      placeholder="Assunto da mensagem"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem*
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none resize-none"
                    placeholder="Como podemos ajudar?"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={sending}
                    style={{ backgroundColor: bgColor, color: textColor }}
                    className="flex items-center justify-center w-full md:w-auto px-8 py-3 rounded-lg font-medium transition-transform hover:shadow-md active:scale-[0.98] disabled:opacity-70"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar mensagem
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Property Carousel Section */}
        <div className="container mx-auto py-12 px-4 md:px-8">
          <PropertyCarousel />
        </div>

        {/* Map Section */}
        <div className="w-full h-[400px] bg-gray-100">
          {false ? (
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.6722371475703!2d-46.653383!3d-23.5651315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c7f481fd9f%3A0x9982bfde4df54830!2sAv.%20Paulista%2C%201000%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2001310-100!5e0!3m2!1spt-BR!2sbr!4v1674824762111!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização no mapa"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Mapa não configurado</p>
                <p className="text-sm">Configure o endereço do Google Maps no painel administrativo</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sobre nós</h3>
              <p className="text-gray-400 mb-4">
                Somos especializados na compra, venda e locação de imóveis residenciais e comerciais. 
                Nosso objetivo é proporcionar a melhor experiência imobiliária para nossos clientes.
              </p>
              {config?.logo && (
                <img 
                  src={config.logo} 
                  alt="Logo" 
                  className="h-12 object-contain opacity-70"
                />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                  {config?.address || 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP'}
                </p>
                <p className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                  {config?.phone || '(11) 9999-9999'}
                </p>
                <p className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                  {config?.email || 'contato@imobiliaria.com.br'}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/properties" className="text-gray-400 hover:text-white transition-colors">
                    Imóveis
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
              
              {/* Social Icons */}
              <div className="mt-6 flex space-x-4">
                {config?.facebookUrl && (
                  <a 
                    href={config.facebookUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook-f text-xl"></i>
                  </a>
                )}
                
                {config?.instagramUrl && (
                  <a 
                    href={config.instagramUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                )}
                
                {config?.linkedinUrl && (
                  <a 
                    href={config.linkedinUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <i className="fab fa-linkedin-in text-xl"></i>
                  </a>
                )}
                
                {config?.youtubeUrl && (
                  <a 
                    href={config.youtubeUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <i className="fab fa-youtube text-xl"></i>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Imobiliária. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;