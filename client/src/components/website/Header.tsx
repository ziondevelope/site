import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { WebsiteConfig } from '@shared/schema';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import NavigationLink from '@/components/ui/navigation-link';

interface HeaderProps {
  config?: WebsiteConfig;
  isLoadingConfig: boolean;
}

export default function Header({ config, isLoadingConfig }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [locationPath] = useLocation();
  
  // Determinamos se estamos na página de propriedades para aplicar o estilo escuro no menu
  const isPropertiesPage = locationPath === "/properties";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 20) {
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

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isPropertiesPage || scrolled 
          ? 'bg-white shadow-lg py-2' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo à esquerda */}
          <div className="flex items-center mr-8">
            {isLoadingConfig ? (
              // Placeholder durante o carregamento - mantém o mesmo tamanho
              <div className={`${scrolled ? 'h-12 w-28' : 'h-16 w-36'} bg-gray-100 rounded animate-pulse transition-all duration-300`}></div>
            ) : config?.logo ? (
              <NavigationLink href="/" className={`${scrolled ? 'h-12 min-w-[112px]' : 'h-16 min-w-[140px]'} transition-all duration-300 cursor-pointer`}>
                <img 
                  src={config.logo} 
                  alt="Logo da Imobiliária" 
                  className="h-full object-contain"
                  loading="eager" 
                  onLoad={(e) => {
                    // Torna a imagem visível quando carregada
                    (e.target as HTMLImageElement).style.opacity = "1";
                  }}
                  style={{ opacity: 0, transition: "opacity 0.2s ease" }}
                />
              </NavigationLink>
            ) : (
              <NavigationLink href="/" className="flex items-center cursor-pointer">
                <div className={`${isPropertiesPage || scrolled ? 'h-8 w-8' : 'h-10 w-10'} rounded bg-primary flex items-center justify-center text-white transition-all duration-300`}>
                  <i className="fas fa-home text-xl"></i>
                </div>
                <h1 className={`${isPropertiesPage || scrolled ? 'text-xl' : 'text-2xl'} font-bold ${isPropertiesPage || scrolled ? 'text-gray-800' : 'text-white'} ml-3 transition-all duration-300`}>Imobiliária</h1>
              </NavigationLink>
            )}
          </div>
          
          {/* Menu ao lado da logo */}
          <nav className="hidden md:flex space-x-8">
            <a href="/#home" className={`${isPropertiesPage || scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Início</a>
            <a href="/#properties" className={`${isPropertiesPage || scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Destaques</a>
            <NavigationLink href="/properties" className={`${isPropertiesPage || scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Todos Imóveis</NavigationLink>
            <a href="/#about" className={`${isPropertiesPage || scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Sobre</a>
            <a href="/#contact" className={`${isPropertiesPage || scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Contato</a>
          </nav>
        </div>
        
        {/* Botão WhatsApp apenas desktop e Menu hamburger para mobile */}
        <div className="flex items-center">
          {/* Botão WhatsApp - visível apenas em desktop */}
          <a 
            href={config?.phone ? `https://wa.me/${config.phone.replace(/\D/g, '')}` : "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`hidden md:inline-flex items-center px-4 py-1 rounded-full border border-solid transition-all hover:bg-white ${
              isPropertiesPage || scrolled ? 'text-primary' : 'text-white'
            }`}
            style={{ 
              borderColor: isPropertiesPage || scrolled 
                ? (config?.primaryColor ? `${config.primaryColor}33` : 'var(--primary-33)') 
                : 'rgba(255, 255, 255, 0.3)',
              color: isPropertiesPage || scrolled ? (config?.primaryColor || 'var(--primary)') : 'white'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = config?.primaryColor || 'var(--primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = isPropertiesPage || scrolled ? (config?.primaryColor || 'var(--primary)') : 'white';
            }}
          >
            {config?.phone && <span className="mr-2">{config.phone}</span>}
            <i 
              className="fab fa-whatsapp text-lg transition-colors" 
              style={{ color: isPropertiesPage || scrolled ? "#25D366" : "white" }}
              ref={(el) => {
                if (el) {
                  el.parentElement?.addEventListener('mouseover', () => {
                    el.style.color = "#25D366";
                  });
                  el.parentElement?.addEventListener('mouseout', () => {
                    el.style.color = isPropertiesPage || scrolled ? "#25D366" : "white";
                  });
                }
              }}
            ></i>
          </a>
          
          {/* Menu hamburger - apenas mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <button 
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-md border relative overflow-hidden group"
                style={{ 
                  backgroundColor: isPropertiesPage || scrolled ? 'white' : 'rgba(255, 255, 255, 0.1)',
                  borderColor: isPropertiesPage || scrolled 
                    ? (config?.primaryColor ? `${config.primaryColor}33` : 'var(--primary-33)') 
                    : 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 w-6 h-6">
                  <span 
                    className="w-4 h-0.5 rounded-full transform origin-center transition-all duration-300"
                    style={{ 
                      width: '16px',
                      backgroundColor: isPropertiesPage || scrolled 
                        ? (config?.primaryColor || 'var(--primary)') 
                        : 'white'
                    }}
                  ></span>
                  <span 
                    className="w-6 h-0.5 rounded-full transform origin-center transition-all duration-300"
                    style={{ 
                      width: '22px',
                      backgroundColor: isPropertiesPage || scrolled 
                        ? (config?.primaryColor || 'var(--primary)') 
                        : 'white'
                    }}
                  ></span>
                  <span 
                    className="w-5 h-0.5 rounded-full transform origin-center transition-all duration-300"
                    style={{ 
                      width: '18px',
                      backgroundColor: isPropertiesPage || scrolled 
                        ? (config?.primaryColor || 'var(--primary)') 
                        : 'white'
                    }}
                  ></span>
                </div>
                <div 
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                  style={{ 
                    backgroundColor: config?.primaryColor || 'var(--primary)'
                  }}
                ></div>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[320px] p-0 border-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Área do logo no topo do menu */}
                <div 
                  className="p-6 border-b"
                  style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}
                >
                  {config?.logo ? (
                    <NavigationLink href="/">
                      <img src={config.logo} alt="Logo" className="h-10 object-contain cursor-pointer" />
                    </NavigationLink>
                  ) : (
                    <NavigationLink href="/" className="flex items-center cursor-pointer">
                      <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white">
                        <i className="fas fa-home text-sm"></i>
                      </div>
                      <span className="text-xl font-bold ml-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Imobiliária</span>
                    </NavigationLink>
                  )}
                </div>
                
                {/* Links do menu simplificados */}
                <div className="px-6 py-5 flex flex-col space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <a 
                    href="/#home" 
                    className="flex items-center py-3 px-6 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0" style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}></div>
                    <span className="text-gray-700 font-medium text-[19px]">Início</span>
                  </a>
                  
                  <a 
                    href="/#properties" 
                    className="flex items-center py-3 px-6 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0" style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}></div>
                    <span className="text-gray-700 font-medium text-[19px]">Destaques</span>
                  </a>
                  
                  <NavigationLink 
                    href="/properties" 
                    className="flex items-center py-3 px-6 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0" style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}></div>
                    <span className="text-gray-700 font-medium text-[19px]">Todos Imóveis</span>
                  </NavigationLink>
                  
                  <a 
                    href="/#about" 
                    className="flex items-center py-3 px-6 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0" style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}></div>
                    <span className="text-gray-700 font-medium text-[19px]">Sobre</span>
                  </a>
                  
                  <a 
                    href="/#contact" 
                    className="flex items-center py-3 px-6 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0" style={{ backgroundColor: config?.primaryColor || 'var(--primary)' }}></div>
                    <span className="text-gray-700 font-medium text-[19px]">Contato</span>
                  </a>
                </div>
                
                {/* Botão de contato na parte inferior */}
                {config?.phone && (
                  <div className="mt-auto border-t p-6" style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}>
                    <a 
                      href={`https://wa.me/${config.phone.replace(/\D/g, '')}`} 
                      className="flex items-center justify-center py-3 px-5 rounded-full bg-primary text-white border-0 transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: config?.primaryColor || 'var(--primary)',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      {config?.phone && <span className="mr-2 text-[18px]" style={{ fontFamily: 'Poppins, sans-serif' }}>{config.phone}</span>}
                      <i className="fab fa-whatsapp text-xl text-white"></i>
                    </a>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}