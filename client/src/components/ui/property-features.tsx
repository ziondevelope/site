import { useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import { Button } from "./button";

interface PropertyFeaturesProps {
  features: string[];
  onChange: (features: string[]) => void;
}

export function PropertyFeatures({ features, onChange }: PropertyFeaturesProps) {
  const [newFeature, setNewFeature] = useState("");

  const addFeature = () => {
    if (newFeature.trim() !== "" && !features.includes(newFeature)) {
      onChange([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    onChange(updatedFeatures);
  };

  return (
    <FormItem>
      <FormLabel>Características do Imóvel</FormLabel>
      <div className="border rounded-md p-4 bg-gray-50">
        <div className="flex flex-wrap gap-2 mb-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white px-3 py-1 rounded-full text-sm border border-gray-200 flex items-center"
            >
              <span>{feature}</span>
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-red-500"
                onClick={() => removeFeature(index)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex">
          <FormControl>
            <Input
              placeholder="Digite uma característica e pressione Enter"
              className="mr-2"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
          </FormControl>
          <Button
            type="button"
            size="sm"
            onClick={addFeature}
          >
            Adicionar
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          Exemplos: Piscina, Churrasqueira, Ar-condicionado, Portaria 24h
        </div>
      </div>
      <FormMessage />
    </FormItem>
  );
}