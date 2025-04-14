import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { WebsiteConfig } from '@shared/schema';

interface HeaderProps {
  config?: WebsiteConfig;
  isLoadingConfig: boolean;
}

export default function Header({ config, isLoadingConfig }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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
        scrolled 
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
                <div className={`${scrolled ? 'h-8 w-8' : 'h-10 w-10'} rounded bg-primary flex items-center justify-center text-white transition-all duration-300`}>
                  <i className="fas fa-home text-xl"></i>
                </div>
                <h1 className={`${scrolled ? 'text-xl' : 'text-2xl'} font-bold ${scrolled ? 'text-gray-800' : 'text-white'} ml-3 transition-all duration-300`}>Imobiliária</h1>
              </>
            )}
          </div>
          
          {/* Menu ao lado da logo */}
          <nav className="hidden md:flex space-x-8">
            <a href="/#home" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Início</a>
            <a href="/#properties" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Imóveis</a>
            <a href="/#about" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Sobre</a>
            <a href="/#contact" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-primary font-medium transition-colors duration-300`}>Contato</a>
          </nav>
        </div>
        
        {/* Botão WhatsApp */}
        <div>
          <a 
            href={config?.phone ? `https://wa.me/${config.phone.replace(/\D/g, '')}` : "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-flex items-center px-4 py-1 rounded-full border border-solid transition-colors hover:bg-gray-50 ${
              scrolled ? 'text-primary' : 'text-white'
            }`}
            style={{ 
              borderColor: scrolled 
                ? (config?.primaryColor ? `${config.primaryColor}33` : 'var(--primary-33)') 
                : 'rgba(255, 255, 255, 0.3)',
              color: scrolled ? (config?.primaryColor || 'var(--primary)') : 'white'
            }}
          >
            {config?.phone && <span className="mr-2">{config.phone}</span>}
            <i className="fab fa-whatsapp text-lg" style={{ color: scrolled ? "#25D366" : "white" }}></i>
          </a>
        </div>
      </div>
    </header>
  );
}