import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Quando a localização (URL) muda, rolamos para o topo da página
    window.scrollTo(0, 0);
  }, [location]);
  
  return null; // Este componente não renderiza nada
}