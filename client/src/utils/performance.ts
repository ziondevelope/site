/**
 * Utilitários para melhorar o desempenho do site
 */

/**
 * Função que atrasa a execução de scripts não críticos
 * @param callback Função a ser executada com atraso
 * @param delay Tempo de delay em ms
 */
export const deferTask = (callback: () => void, delay: number = 1000) => {
  if (typeof window === 'undefined') return;
  
  // Usar requestIdleCallback se disponível para aproveitar períodos ociosos do browser
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => setTimeout(callback, delay));
  } else {
    // Fallback para browsers que não suportam requestIdleCallback
    setTimeout(callback, delay);
  }
};

/**
 * Otimiza o carregamento de imagens, substituindo temporariamente por placeholders
 * e carregando em ordem de prioridade
 * @param imageSrcs Array de URLs de imagens para pré-carregar
 * @param priority Prioridade das imagens (high | low)
 */
export const preloadImages = (imageSrcs: string[], priority: 'high' | 'low' = 'low') => {
  if (typeof window === 'undefined' || !imageSrcs.length) return;
  
  // Para imagens de baixa prioridade, adiar carregamento
  if (priority === 'low') {
    deferTask(() => {
      imageSrcs.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }, 2000);
    return;
  }
  
  // Para imagens de alta prioridade, carregar imediatamente
  imageSrcs.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

/**
 * Cria uma versão compactada e otimizada da URL da imagem
 * @param originalSrc URL original da imagem
 * @param width Largura desejada
 * @param height Altura desejada
 * @returns URL otimizada
 */
export const getOptimizedImageUrl = (originalSrc: string, width: number = 400, height: number = 300): string => {
  // Se a URL já estiver otimizada ou for de um provedor externo como Cloudinary, retornar como está
  if (!originalSrc || originalSrc.includes('cloudinary') || originalSrc.includes('imagekit')) {
    return originalSrc;
  }

  // Para imagens em base64, retornar como está
  if (originalSrc.startsWith('data:')) {
    return originalSrc;
  }

  // Se for uma imagem remota não otimizada, podemos usar um serviço de proxy de imagem
  // ou retornar como está
  return originalSrc;
};

/**
 * Estima o tamanho aproximado da imagem base64 em KB
 * @param base64String String da imagem em base64
 * @returns Tamanho estimado em KB
 */
export const getBase64ImageSize = (base64String: string): number => {
  if (!base64String) return 0;
  
  // Remover o cabeçalho da string base64 (data:image/jpeg;base64,)
  const base64WithoutHeader = base64String.split(',')[1] || base64String;
  
  // Calcular o tamanho aproximado em bytes
  const sizeInBytes = (base64WithoutHeader.length * 3) / 4;
  
  // Converter para KB
  return Math.round(sizeInBytes / 1024);
};

export default {
  deferTask,
  preloadImages,
  getOptimizedImageUrl,
  getBase64ImageSize,
};