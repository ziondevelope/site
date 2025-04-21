import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

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
  // Buscar depoimentos da API
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    refetchOnWindowFocus: false,
  });
  
  // Mostrar todos os depoimentos sem filtragem ou limitação
  const displayedTestimonials = testimonials;
  
  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Depoimentos</h2>
            <p className="text-gray-600">O que nossos clientes dizem sobre nós</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
        
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedTestimonials.map((testimonial: Testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm">
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
          ))}
        </div>
      </div>
    </div>
  );
}