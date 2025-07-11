import { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Camera, Star, StarOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  isFeatured?: boolean;
}

interface MultipleImageUploadProps {
  onChange: (images: GalleryImage[]) => void;
  value?: GalleryImage[];
  label?: string;
  disabled?: boolean;
  maxImages?: number;
}

export const MultipleImageUpload = ({
  onChange,
  value = [],
  label,
  disabled,
  maxImages = 10
}: MultipleImageUploadProps) => {
  const [images, setImages] = useState<GalleryImage[]>(value || []);
  
  const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (images.length >= maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newImage: GalleryImage = {
        url: base64,
        isFeatured: images.length === 0 // Se for a primeira imagem, marca como destaque
      };
      
      const newImages = [...images, newImage];
      setImages(newImages);
      onChange(newImages);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    const removedImage = newImages.splice(index, 1)[0];
    
    // Se a imagem removida era destaque, definir a primeira imagem como destaque (se existir)
    if (removedImage.isFeatured && newImages.length > 0) {
      newImages[0].isFeatured = true;
    }
    
    setImages(newImages);
    onChange(newImages);
  };

  const handleSetFeatured = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isFeatured: i === index
    }));
    
    setImages(newImages);
    onChange(newImages);
  };

  return (
    <div className="space-y-4 w-full">
      {label && <Label className="text-left block">{label}</Label>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="relative overflow-hidden group">
            <div className="relative h-32 w-full">
              <img 
                src={image.url} 
                alt={`Imagem ${index + 1}`} 
                className={cn(
                  "h-full w-full object-cover transition-all",
                  image.isFeatured && "ring-2 ring-yellow-400"
                )}
              />
              
              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={() => handleSetFeatured(index)}
                  disabled={image.isFeatured || disabled}
                >
                  {image.isFeatured ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Badge de destaque */}
              {image.isFeatured && (
                <div className="absolute top-1 right-1 bg-yellow-400 text-xs text-black px-1.5 py-0.5 rounded-sm">
                  Capa
                </div>
              )}
            </div>
          </Card>
        ))}
        
        {/* Adicionar nova imagem */}
        {images.length < maxImages && (
          <Card 
            className="flex flex-col items-center justify-center h-32 border-dashed cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => document.getElementById('gallery-upload')?.click()}
          >
            <Camera className="h-8 w-8 text-gray-400" />
            <p className="text-xs text-gray-500 mt-2">Adicionar</p>
          </Card>
        )}
      </div>
      
      <input
        id="gallery-upload"
        type="file"
        accept="image/*"
        onChange={handleAddImage}
        className="hidden"
        disabled={disabled}
      />
      
      <p className="text-xs text-gray-500 mt-2">
        {images.length > 0 
          ? `${images.length} de ${maxImages} imagens adicionadas. Clique na estrela para definir a imagem de capa.`
          : `Adicione até ${maxImages} imagens. A primeira será a capa.`}
      </p>
    </div>
  );
};