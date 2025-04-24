import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { WebsiteConfig } from "@shared/schema";

interface Testimonial {
  id: number;
  name: string;
  role?: string;
  content: string;
  avatar?: string;
  featured: boolean;
  createdAt: string;
}

interface TestimonialsProps {
  config?: WebsiteConfig;
}

export function Testimonials({ config }: TestimonialsProps) {
  
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
    const handleSelect = () => {
      if (emblaApi) {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      }
    };
    
    if (emblaApi) {
      emblaApi.on('select', handleSelect);
    }
    
    return () => {
      if (cleanupAutoplay) cleanupAutoplay();
      if (emblaApi) {
        // Remover o event listener ao desmontar o componente
        emblaApi.off('select', handleSelect);
      }
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
        <div className="relative px-4 py-2">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial: Testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] px-4"
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
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.length > 0 && testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-black" : "bg-gray-300 hover:bg-gray-400"
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