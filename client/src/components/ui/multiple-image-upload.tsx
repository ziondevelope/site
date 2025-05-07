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
  maxFiles?: number; // Para compatibilidade
}

export const MultipleImageUpload = ({
  onChange,
  value = [],
  label,
  disabled,
  maxImages = 50,
  maxFiles
}: MultipleImageUploadProps) => {
  // Se maxFiles for fornecido, usar ele no lugar de maxImages
  const maxImagesCount = maxFiles || maxImages;
  const [images, setImages] = useState<GalleryImage[]>(value || []);

  const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= maxImagesCount) {
      alert(`Você pode adicionar no máximo ${maxImagesCount} imagens.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64 = reader.result as string;
        const newImage: GalleryImage = {
          url: base64,
          isFeatured: images.length === 0 // Se for a primeira imagem, marca como destaque
        };

        const newImages = [...images, newImage];
        setImages(newImages);
        onChange(newImages);
      } catch (error) {
        console.error('Erro ao processar a imagem:', error);
        alert('Ocorreu um erro ao processar a imagem. Tente novamente.');
      }
    };
    reader.onerror = (error) => {
      console.error('Erro ao ler o arquivo:', error);
      alert('Ocorreu um erro ao processar a imagem. Tente novamente.');
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
        {images.length < maxImagesCount && (
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
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length + images.length > maxImagesCount) {
            alert(`Você pode adicionar no máximo ${maxImagesCount} imagens.`);
            return;
          }

          const processImage = async (file: File) => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;

                  const maxWidth = 400;
                  const maxHeight = 400;

                  // Calculate dimensions keeping aspect ratio
                  if (width > height) {
                    if (width > maxWidth) {
                      height = Math.floor(height * (maxWidth / width));
                      width = maxWidth;
                    }
                  } else {
                    if (height > maxHeight) {
                      width = Math.floor(width * (maxHeight / height));
                      height = maxHeight;
                    }
                  }

                  canvas.width = width;
                  canvas.height = height;

                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0, width, height);

                  // Convert to JPEG with very low quality and downscale to reduce size
                  const quality = 0.1; // Reduce quality to 10%
                  const downscaledCanvas = document.createElement('canvas');
                  downscaledCanvas.width = Math.floor(width * 0.75);
                  downscaledCanvas.height = Math.floor(height * 0.75);
                  const downscaledCtx = downscaledCanvas.getContext('2d');
                  downscaledCtx?.drawImage(canvas, 0, 0, downscaledCanvas.width, downscaledCanvas.height);

                  resolve(downscaledCanvas.toDataURL('image/jpeg', quality));
                };
                img.src = e.target?.result as string;
              };
              reader.readAsDataURL(file);
            });
          };

          Promise.all(
            Array.from(files).map(async (file) => {
              const compressedUrl = await processImage(file);
              return {
                url: compressedUrl,
                isFeatured: images.length === 0
              };
            })
          ).then((newImages) => {
            const updatedImages = [...images, ...newImages];
            setImages(updatedImages);
            onChange(updatedImages);
          });
        }}
        className="hidden"
        disabled={disabled}
      />

      <p className="text-xs text-gray-500 mt-2">
        {images.length > 0 
          ? `${images.length} de ${maxImagesCount} imagens adicionadas. Clique na estrela para definir a imagem de capa.`
          : `Adicione até ${maxImagesCount} imagens. A primeira será a capa.`}
      </p>
    </div>
  );
};