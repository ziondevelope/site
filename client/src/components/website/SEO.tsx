import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { WebsiteConfig } from '@shared/schema';

interface SEOProps {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  favicon?: string | null;
  ogImage?: string | null;
  path?: string;
}

export default function SEO({ 
  title, 
  description, 
  keywords,
  favicon,
  ogImage,
  path = '/'
}: SEOProps) {
  // Carregar configurações do site
  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config'],
    staleTime: 60 * 1000, // 1 minuto
  });

  // Usar valores personalizados ou valores da config
  const pageTitle = title || config?.seoTitle || 'Imobiliária';
  const pageDescription = description || config?.seoDescription || 'Site de imobiliária';
  const pageKeywords = keywords || config?.seoKeywords || 'imobiliária, imóveis';
  
  // Usar favicon personalizado, ou o campo favicon das configurações, ou logo como fallback
  const siteFavicon = favicon || config?.favicon || config?.logo || '';
  
  // Imagem para compartilhamento OG (Open Graph)
  const siteOgImage = ogImage || config?.bannerBackground || '';

  // URL base do site
  const siteUrl = window.location.origin;
  const canonicalUrl = `${siteUrl}${path}`;
  
  return (
    <Helmet>
      {/* Título e metadados básicos */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon */}
      {siteFavicon && <link rel="icon" href={siteFavicon} />}
      {siteFavicon && <link rel="apple-touch-icon" href={siteFavicon} />}
      
      {/* Metadados Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      {siteOgImage && <meta property="og:image" content={siteOgImage} />}
      
      {/* Metadados Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {siteOgImage && <meta name="twitter:image" content={siteOgImage} />}
    </Helmet>
  );
}