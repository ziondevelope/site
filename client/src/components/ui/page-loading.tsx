import React from 'react';

interface PageLoadingProps {
  isLoading: boolean;
}

export default function PageLoading({ isLoading }: PageLoadingProps) {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <div className="mt-4 text-primary font-semibold">Carregando...</div>
      </div>
    </div>
  );
}