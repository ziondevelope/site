import React, { useState, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderColor?: string;
  aspectRatio?: string;
}

/**
 * LazyImage component para otimização de carregamento de imagens
 * Carrega imagens de forma preguiçosa e exibe placeholder até o carregamento
 */
export default function LazyImage({
  src,
  alt,
  className,
  placeholderColor = '#e2e8f0',
  aspectRatio = '4/3',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  // Carregar a imagem após o carregamento inicial da página
  useEffect(() => {
    if (!src) {
      setIsError(true);
      return;
    }

    // Definir um pequeno atraso para imagens que não são visíveis na viewport
    const timer = setTimeout(() => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setIsError(true);
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden ${className || ''}`}
      style={{ aspectRatio, backgroundColor: placeholderColor }}
    >
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt || ''}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          {...props}
        />
      )}
    </div>
  );
}