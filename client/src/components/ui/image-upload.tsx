import { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ImageUploadProps {
  onChange: (base64: string) => void;
  value?: string;
  label?: string;
  disabled?: boolean;
}

export const ImageUpload = ({
  onChange,
  value,
  label,
  disabled
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {label && <Label className="text-center">{label}</Label>}
      <div className="relative w-32 h-32 mx-auto">
        <Avatar className="w-32 h-32 border-2 border-gray-200">
          <AvatarImage src={preview || ''} alt="Preview" className="object-cover" />
          <AvatarFallback className="bg-gray-100 text-gray-400 text-3xl">
            <i className="ri-user-3-line"></i>
          </AvatarFallback>
        </Avatar>
        <Button 
          type="button"
          variant="outline" 
          size="icon"
          disabled={disabled}
          className="absolute bottom-0 right-0 rounded-full bg-white h-8 w-8 shadow-md hover:bg-gray-50"
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          <i className="ri-camera-line text-gray-600"></i>
        </Button>
      </div>
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <p className="text-xs text-center text-gray-500 mt-2">
        Clique para adicionar uma foto
      </p>
    </div>
  );
};