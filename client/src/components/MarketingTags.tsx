import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { WebsiteConfig } from '@shared/schema';

/**
 * Componente que inclui as tags de marketing e conversão no head do documento
 * Utiliza react-helmet-async para inserir scripts no head sem causar problemas de rerenderização
 */
export default function MarketingTags() {
  // Busca as configurações do site que contém as tags de marketing
  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Se não houver dados de configuração, não renderiza nada
  if (!config) return null;

  // Extrai as tags de marketing da configuração
  const { googleAdsConversionTag, googleAdsRemarketingTag, facebookPixelTag } = config;

  // Só renderiza tags que não estão vazias
  return (
    <Helmet>
      {/* Google Ads - Tag de Conversão */}
      {googleAdsConversionTag && (
        <script 
          type="text/javascript" 
          dangerouslySetInnerHTML={{ __html: googleAdsConversionTag }} 
        />
      )}

      {/* Google Ads - Tag de Remarketing */}
      {googleAdsRemarketingTag && (
        <script 
          type="text/javascript" 
          dangerouslySetInnerHTML={{ __html: googleAdsRemarketingTag }} 
        />
      )}

      {/* Meta (Facebook) Pixel */}
      {facebookPixelTag && (
        <script 
          type="text/javascript" 
          dangerouslySetInnerHTML={{ __html: facebookPixelTag }} 
        />
      )}
    </Helmet>
  );
}