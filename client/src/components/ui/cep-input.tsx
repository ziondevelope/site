import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface CepInputProps {
  form: any;
  field: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
  };
}

// Função para buscar dados do CEP
async function fetchAddressByCep(cep: string) {
  try {
    cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cep.length !== 8) {
      return null;
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }
    
    const data = await response.json();
    
    if (data.erro) {
      return null;
    }
    
    return {
      neighborhood: data.bairro,
      city: data.localidade,
      address: `${data.logradouro}${data.complemento ? ', ' + data.complemento : ''}`
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

export function CepInput({ form, field }: CepInputProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e);
    
    // Se o CEP tiver 8 dígitos (sem contar hífen), busca os dados
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsLoading(true);
      
      try {
        const data = await fetchAddressByCep(cep);
        
        if (data) {
          // Preenche os campos com os dados retornados
          form.setValue('city', data.city);
          form.setValue('neighborhood', data.neighborhood);
          form.setValue('address', data.address);
          
          toast({
            title: "CEP encontrado",
            description: "Dados de endereço preenchidos automaticamente.",
          });
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Não foi possível encontrar o endereço para este CEP.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Ocorreu um erro ao buscar o endereço. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <FormItem>
      <FormLabel>CEP</FormLabel>
      <div className="flex items-center space-x-2">
        <FormControl>
          <Input 
            placeholder="00000-000" 
            value={field.value} 
            onChange={handleCepChange}
          />
        </FormControl>
        {isLoading && (
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
}