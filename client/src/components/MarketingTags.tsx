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
  const { 
    googleTagManagerTag,
    googleAdsConversionTag, 
    googleAdsRemarketingTag, 
    facebookPixelTag 
  } = config;

  // Só renderiza tags que não estão vazias
  return (
    <Helmet>
      {/* Google Tag Manager */}
      {googleTagManagerTag && (
        <>
          {/* Script que deve ser colocado na tag <head> */}
          <script 
            type="text/javascript" 
            dangerouslySetInnerHTML={{ __html: googleTagManagerTag }} 
          />
          
          {/* Tag noscript que deve ser colocada após a abertura da tag <body> - não pode ser feito com Helmet */}
          {/* Para isso, seria necessário usar um componente que injete esse script diretamente no início do body */}
          {/* Como solução, o GTM pode ser configurado para injetar tanto a parte head quanto a body em um único script */}
        </>
      )}

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