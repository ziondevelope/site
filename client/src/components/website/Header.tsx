import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { WebsiteConfig } from '@shared/schema';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
              <div className={`${scrolled ? 'h-12 min-w-[112px]' : 'h-16 min-w-[140px]'} transition-all duration-300`}>
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
              </div>
            ) : (
              <>
                <div className={`${isPropertiesPage || scrolled ? 'h-8 w-8' : 'h-10 w-10'} rounded bg-primary flex items-center justify-center text-white transition-all duration-300`}>
                  <i className="fas fa-home text-xl"></i>
                </div>
                <h1 className={`${isPropertiesPage || scrolled ? 'text-xl' : 'text-2xl'} font-bold ${isPropertiesPage || scrolled ? 'text-gray-800' : 'text-white'} ml-3 transition-all duration-300`}>Imobiliária</h1>
              </>
            )}
          </div>
          
          {/* Menu ao lado da logo */}
          <nav className="hidden md:flex space-x-8">
            <a href="/#home" className={`${isPropertiesPage || scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Início</a>
            <a href="/#properties" className={`${isPropertiesPage || scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Destaques</a>
            <Link href="/properties" className={`${isPropertiesPage || scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Todos Imóveis</Link>
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
              <button className="md:hidden flex flex-col items-center justify-center gap-1.5 w-8 h-8">
                <span className={`w-5 h-0.5 rounded-full transition-all ${isPropertiesPage || scrolled ? 'bg-gray-800' : 'bg-white'}`}></span>
                <span className={`w-5 h-0.5 rounded-full transition-all ${isPropertiesPage || scrolled ? 'bg-gray-800' : 'bg-white'}`}></span>
                <span className={`w-5 h-0.5 rounded-full transition-all ${isPropertiesPage || scrolled ? 'bg-gray-800' : 'bg-white'}`}></span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[280px] p-6">
              <div className="flex flex-col h-full">
                <div className="flex flex-col">
                  <a href="/#home" className="py-3 text-lg hover:text-primary">
                    Início
                  </a>
                  <a href="/#properties" className="py-3 text-lg hover:text-primary">
                    Destaques
                  </a>
                  <Link href="/properties" className="py-3 text-lg hover:text-primary">
                    Todos Imóveis
                  </Link>
                  <a href="/#about" className="py-3 text-lg hover:text-primary">
                    Sobre
                  </a>
                  <a href="/#contact" className="py-3 text-lg hover:text-primary">
                    Contato
                  </a>
                </div>
                
                {config?.phone && (
                  <div className="mt-auto pt-6">
                    <a 
                      href={`https://wa.me/${config.phone.replace(/\D/g, '')}`} 
                      className="flex items-center justify-center py-3 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-whatsapp mr-2"></i>
                      <span>Fale conosco</span>
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