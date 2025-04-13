import { useState, ChangeEvent, useRef } from "react";
import { Button } from "./button";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageBase64: string) => void;
  onRemoveImage: () => void;
  previewClassName?: string;
  label?: string;
}

export function ImageUpload({ 
  currentImage, 
  onImageChange, 
  onRemoveImage,
  previewClassName = "w-32 h-32",
  label = "Selecionar Imagem"
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar o tipo do arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    // Validar o tamanho do arquivo (limite de 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter menos de 2MB.');
      return;
    }

    setIsLoading(true);
    
    try {
      const base64 = await convertToBase64(file);
      onImageChange(base64);
    } catch (error) {
      console.error('Erro ao processar a imagem:', error);
      alert('Ocorreu um erro ao processar a imagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className={`${previewClassName} bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        ) : currentImage ? (
          <img src={currentImage} alt="Preview" className="max-w-full max-h-full object-contain" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={triggerFileInput}
          disabled={isLoading}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          title="Upload Imagem"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
            <line x1="16" x2="22" y1="5" y2="5"></line>
            <line x1="19" x2="19" y1="2" y2="8"></line>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
        </Button>
        
        {currentImage && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onRemoveImage}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            title="Remover Imagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}