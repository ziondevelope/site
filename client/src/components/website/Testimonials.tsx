import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from 'embla-carousel-react';

// Estilos CSS para o carrossel
const carouselCSS = `
.embla {
  position: relative;
  padding: 20px;
}

.embla__viewport {
  overflow: hidden;
  width: 100%;
  border-radius: 10px;
}

.embla__container {
  display: flex;
  user-select: none;
  -webkit-touch-callout: none;
  -khtml-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.embla__slide {
  position: relative;
  min-width: 100%;
  padding: 0 10px;
  transition: transform 0.3s ease;
}

.embla__slide--active {
  z-index: 1;
}

@media (min-width: 640px) {
  .embla__slide {
    min-width: 50%;
  }
}

@media (min-width: 768px) {
  .embla__slide {
    min-width: 33.33%;
  }
}

.embla__dots {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.embla__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}
`;

interface Testimonial {
  id: number;
  name: string;
  role?: string;
  content: string;
  avatar?: string;
  featured: boolean;
  createdAt: string;
}

export function Testimonials() {
  // Adicionar os estilos do carrossel ao documento
  useEffect(() => {
    // Criar um elemento style
    const styleElement = document.createElement('style');
    styleElement.textContent = carouselCSS;
    document.head.appendChild(styleElement);
    
    // Limpar o elemento style ao desmontar o componente
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Embla carousel setup
  // Configuração do carrossel com 3 slides visíveis em telas grandes
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    slidesToScroll: 1,
    dragFree: false,
    containScroll: "trimSnaps"
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-play para o carrossel a cada 2 segundos
  const autoplay = useCallback(() => {
    if (!emblaApi) return undefined;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [emblaApi]);
  
  useEffect(() => {
    // Iniciar autoplay quando o carrossel estiver pronto
    const cleanupAutoplay = autoplay();
    
    // Atualizar o índice atual quando o slide mudar
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      });
    }
    
    return () => {
      if (cleanupAutoplay) cleanupAutoplay();
      if (emblaApi) emblaApi.off('select');
    };
  }, [emblaApi, autoplay]);
  
  // Buscar depoimentos da API
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Depoimentos</h2>
            <p className="text-gray-600">O que nossos clientes dizem sobre nós</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="ml-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (testimonials.length === 0) {
    return null;
  }
  
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Depoimentos</h2>
          <p className="text-gray-600">O que nossos clientes dizem sobre nós</p>
        </div>
        
        {/* Carrossel Embla */}
        <div className="embla">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container">
              {testimonials.map((testimonial: Testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="embla__slide"
                >
                  <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12">
                        {testimonial.avatar ? (
                          <AvatarImage 
                            src={testimonial.avatar} 
                            alt={testimonial.name}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <AvatarFallback className="bg-indigo-100 text-indigo-600">
                            {testimonial.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">{testimonial.name}</h3>
                        {testimonial.role && (
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicadores de slide */}
          <div className="embla__dots">
            {testimonials.length > 0 && testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`embla__dot ${
                  index === currentIndex ? "bg-indigo-600" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Ir para o depoimento ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}