import React, { useEffect, useState } from 'react';

interface PageLoadingProps {
  isLoading: boolean;
}

export default function PageLoading({ isLoading }: PageLoadingProps) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      setShow(true);
    } else {
      // Pequeno atraso para evitar flash na tela
      timer = setTimeout(() => {
        setShow(false);
      }, 300);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center transition-opacity duration-300"
         style={{ opacity: isLoading ? 1 : 0 }}>
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Carregando...</p>
      </div>
    </div>
  );
}