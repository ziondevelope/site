import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  interestTypeFilter: string;
  setInterestTypeFilter: (value: string) => void;
}

export function LeadFilters({ 
  searchTerm, 
  setSearchTerm, 
  sourceFilter, 
  setSourceFilter, 
  interestTypeFilter, 
  setInterestTypeFilter 
}: LeadFiltersProps) {
  return (
    <div className="mb-6 bg-[#F9FAFB] rounded-lg p-4 border border-gray-100">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </div>
          <Input
            placeholder="Buscar por nome, email, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        
        <div className="w-full md:w-auto min-w-[180px]">
          <Label htmlFor="sourceFilter" className="text-xs text-gray-500 mb-1 ml-1 block">
            Filtrar por fonte
          </Label>
          <Select 
            value={sourceFilter} 
            onValueChange={setSourceFilter}
          >
            <SelectTrigger id="sourceFilter" className="h-10">
              <SelectValue placeholder="Todas as fontes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fontes</SelectItem>
              <SelectItem value="manual">Cadastro manual</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="indicacao">Indicação</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto min-w-[180px]">
          <Label htmlFor="interestFilter" className="text-xs text-gray-500 mb-1 ml-1 block">
            Filtrar por interesse
          </Label>
          <Select 
            value={interestTypeFilter} 
            onValueChange={setInterestTypeFilter}
          >
            <SelectTrigger id="interestFilter" className="h-10">
              <SelectValue placeholder="Todos os interesses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os interesses</SelectItem>
              <SelectItem value="purchase">Compra</SelectItem>
              <SelectItem value="rent">Aluguel</SelectItem>
              <SelectItem value="sale">Venda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}