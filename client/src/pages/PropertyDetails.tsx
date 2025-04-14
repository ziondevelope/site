import { useParams } from 'wouter';
import { WebsiteConfig } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/website/Header';
import PropertyDetailsContent from '@/components/website/PropertyDetailsContent';

export default function PropertyDetails() {
  const { id } = useParams();

  // Fetch website configuration
  const { data: config, isLoading: isLoadingConfig } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config']
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Usar o componente Header */}
      <Header config={config} isLoadingConfig={isLoadingConfig} />

      {/* Conteúdo principal */}
      <main className="flex-grow bg-white pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <PropertyDetailsContent propertyId={id} primaryColor={config?.primaryColor} />
          </div>
        </div>
      </main>
    </div>
  );
}