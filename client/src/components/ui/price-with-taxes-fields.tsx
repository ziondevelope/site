import React from "react";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type PriceWithTaxesFieldsProps = {
  priceField: any;
  iptuField: any;
  condoField: any;
};

export function PriceWithTaxesFields({ priceField, iptuField, condoField }: PriceWithTaxesFieldsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <FormItem>
        <FormLabel>Preço (R$)</FormLabel>
        <FormControl>
          <Input 
            type="number" 
            placeholder="Ex: 450000" 
            {...priceField}
            onChange={(e) => priceField.onChange(e.target.valueAsNumber || 0)}
            value={priceField.value || 0}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
      
      <FormItem>
        <FormLabel>IPTU Anual (R$)</FormLabel>
        <FormControl>
          <Input 
            type="number" 
            placeholder="Ex: 2000" 
            {...iptuField}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : e.target.valueAsNumber;
              iptuField.onChange(value);
            }}
            value={iptuField.value === undefined ? '' : iptuField.value}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
      
      <FormItem>
        <FormLabel>Condomínio (R$)</FormLabel>
        <FormControl>
          <Input 
            type="number" 
            placeholder="Ex: 500" 
            {...condoField}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : e.target.valueAsNumber;
              condoField.onChange(value);
            }}
            value={condoField.value === undefined ? '' : condoField.value}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </div>
  );
}