import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface CepInputProps {
  form?: any;
  field?: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
  };
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  onBlur?: () => void;
  onAddressFound?: (addressData: any) => void;
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

export function CepInput(props: CepInputProps) {
  const { form, field, value, onChange, name, onBlur, onAddressFound } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(
    field?.value !== undefined && field?.value !== null 
      ? field.value 
      : (value !== undefined && value !== null ? value : "")
  );

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Chama o onChange apropriado conforme a prop passada
    if (field) {
      field.onChange(e);
    } else if (onChange) {
      onChange(newValue);
    }
    
    // Se o CEP tiver 8 dígitos (sem contar hífen), busca os dados
    const cep = newValue.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsLoading(true);
      
      try {
        const data = await fetchAddressByCep(cep);
        
        if (data) {
          if (form) {
            // Preenche os campos com os dados retornados via form (versão antiga)
            form.setValue('city', data.city);
            form.setValue('neighborhood', data.neighborhood);
            form.setValue('address', data.address);
          } else if (onAddressFound) {
            // Notifica o componente pai sobre os dados encontrados (versão nova)
            onAddressFound({
              logradouro: data.address,
              bairro: data.neighborhood,
              localidade: data.city,
            });
          }
          
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

  // Atualiza o inputValue quando as props externas mudam
  if ((field && field.value !== undefined && field.value !== null && field.value !== inputValue) || 
      (value !== undefined && value !== null && value !== inputValue)) {
    setInputValue(
      field?.value !== undefined && field?.value !== null 
        ? field.value 
        : (value !== undefined && value !== null ? value : "")
    );
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <FormItem>
      <FormLabel>CEP</FormLabel>
      <div className="flex items-center space-x-2">
        <FormControl>
          <Input 
            placeholder="00000-000" 
            value={inputValue}
            name={field?.name || name}
            onChange={handleCepChange}
            onBlur={handleBlur}
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